import 'dart:async';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import '../services/server_service.dart';
import '../services/sms_service.dart';
import '../services/storage_service.dart';
import '../utils/logger.dart';

class AppState extends ChangeNotifier {
  final SmsService _smsService = SmsService();
  late final ServerService _serverService;
  
  List<LogEntry> _logs = [];
  Map<Permission, PermissionStatus> _permissions = {};
  bool _isSyncing = false;
  String? _localIp;
  Timer? _ipTimer;
  Timer? _syncTimer;
  Timer? _tasksTimer;

  AppState() {
    _serverService = ServerService(_smsService, 
      port: 3001
    );

    _listenToLogs();
    _checkPermissions();
    _refreshIp();

    // Auto-sync on startup if enabled
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (autoSync) syncWithBackend();
    });

    _ipTimer = Timer.periodic(const Duration(seconds: 30), (_) => _refreshIp());
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (autoSync) syncWithBackend(silent: true);
    });
    _tasksTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (autoSync && _serverService.isRunning) _pollPendingTasks();
    });
  }

  @override
  void dispose() {
    _ipTimer?.cancel();
    _syncTimer?.cancel();
    _tasksTimer?.cancel();
    syncOffline();
    super.dispose();
  }

  Future<void> syncOffline() async {
    if (syncUrl.isEmpty) return;
    try {
      await http.post(
        Uri.parse(syncUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'gateway_id': 'flutter_sms_gateway',
          'status': 'offline',
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );
    } catch (_) {}
  }

  // Getters
  List<LogEntry> get logs => _logs;
  bool get isServerRunning => _serverService.isRunning;
  int get port => 3001;
  String? get localIp => _localIp;
  String get publicUrl => StorageService.tunnelUrl;
  String get syncUrl => StorageService.syncUrl;
  bool get autoSync => StorageService.autoSync;
  bool get isSyncing => _isSyncing;
  Map<Permission, PermissionStatus> get permissions => _permissions;

  Future<void> _refreshIp() async {
    final ip = await _serverService.getLocalIp();
    if (_localIp != ip) {
      _localIp = ip;
      notifyListeners();
    }
  }

  Future<void> _pollPendingTasks() async {
    if (syncUrl.isEmpty) return;
    try {
      final apiUrl = syncUrl.replaceAll('/devices/sync', '');
      final response = await http.get(Uri.parse('$apiUrl/tasks/pending')).timeout(const Duration(seconds: 3));
      
      if (response.statusCode == 200) {
        final List<dynamic> tasks = json.decode(response.body);
        if (tasks.isEmpty) return;
        
        List<String> sentIds = [];
        for (final task in tasks) {
           await _smsService.sendSms(task['recipient'], task['message']);
           sentIds.add(task['id']);
        }
        
        if (sentIds.isNotEmpty) {
           await http.patch(
             Uri.parse('$apiUrl/tasks/pending/mark-sent'),
             headers: {'Content-Type': 'application/json'},
             body: json.encode({'ids': sentIds})
           );
        }
      }
    } catch (_) {
      // Ignore polling errors completely
    }
  }

  void _listenToLogs() {
    AppLogger.logs.listen((entry) {
      _logs.insert(0, entry);
      if (_logs.length > 100) _logs.removeLast();
      notifyListeners();
    });
  }

  Future<void> _checkPermissions() async {
    final statuses = await [
      Permission.sms,
      Permission.phone,
      Permission.camera,
    ].request();
    
    _permissions = statuses;
    notifyListeners();
  }

  Future<void> requestPermissions() async {
    await _checkPermissions();
  }

  void handleQrResult(String code) {
    try {
      final data = json.decode(code);
      if (data['syncUrl'] != null) updateSyncUrl(data['syncUrl']);
      if (data['port'] != null) updatePort(int.parse(data['port'].toString()));
      AppLogger.success('Configuration updated via QR code');
      
      // Auto connect and start server
      syncWithBackend().then((success) async {
        if (success && !_serverService.isRunning) {
          await _serverService.start();
          AppLogger.success('Server auto-started after connection established');
          await syncWithBackend(); // Sync online status
          notifyListeners();
        }
      });
    } catch (e) {
      if (code.startsWith('http')) {
        updateSyncUrl(code);
        AppLogger.success('Sync URL updated via QR code');
        syncWithBackend().then((success) async {
          if (success && !_serverService.isRunning) {
            await _serverService.start();
            AppLogger.success('Server auto-started after connection established');
            await syncWithBackend();
            notifyListeners();
          }
        });
      } else {
        AppLogger.error('Invalid QR code format');
      }
    }
  }

  Future<void> toggleServer() async {
    try {
      if (_serverService.isRunning) {
        await _serverService.stop();
        AppLogger.info('Server stopped manually');
        if (syncUrl.isNotEmpty) await syncWithBackend();
      } else {
        if (syncUrl.isNotEmpty) {
          AppLogger.info('Verifying backend connection...');
          final success = await syncWithBackend();
          if (!success) {
            AppLogger.error('Cannot start server: failed to connect to backend.');
            return;
          }
        }
        await _serverService.start();
        AppLogger.success('Server started successfully');
        if (syncUrl.isNotEmpty) await syncWithBackend();
      }
      
      notifyListeners();
    } catch (e) {
      AppLogger.error('Server action failed: $e');
    }
  }

  Future<bool> syncWithBackend({bool silent = false}) async {
    if (syncUrl.isEmpty) {
      if (!silent) AppLogger.info('Backend Sync URL not set. Skipping sync.');
      return false;
    }

    _isSyncing = true;
    notifyListeners();

    try {
      AppLogger.info('Syncing status with backend: $syncUrl');
      
      String effectivePublicUrl = publicUrl;
      if (effectivePublicUrl.isEmpty && _localIp != null) {
        effectivePublicUrl = 'http://$_localIp:$port';
      }
      
      final response = await http.post(
        Uri.parse(syncUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'gateway_id': 'flutter_sms_gateway',
          'public_url': effectivePublicUrl,
          'local_port': port,
          'status': isServerRunning ? 'online' : 'offline',
          'phone_number': 'Mobile Node', 
          'sim_operator': 'Flutter Gateway',
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (!silent) AppLogger.success('Successfully synced with backend');
        
        // Handle automatic updates from backend
        try {
          final data = json.decode(response.body);
          if (data['port'] != null) updatePort(int.parse(data['port'].toString()));
          if (data['public_url'] != null) updatePublicUrl(data['public_url']);
          if (data['auto_sync'] != null) toggleAutoSync(data['auto_sync'] == true);
        } catch (e) {
          // Response might not be JSON or might not contain settings, ignore
        }
        return true;
      } else {
        AppLogger.error('Backend sync failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      AppLogger.error('Error during backend sync: $e');
      return false;
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  void updatePort(int port) {
    StorageService.port = 3001;
    _serverService.updateSettings(port: 3001);
    notifyListeners();
  }
  
  void updatePublicUrl(String url) {
    StorageService.tunnelUrl = url;
    notifyListeners();
    if (autoSync) syncWithBackend();
  }

  void updateSyncUrl(String url) {
    StorageService.syncUrl = url;
    notifyListeners();
  }

  void toggleAutoSync(bool value) {
    StorageService.autoSync = value;
    notifyListeners();
  }

  Future<void> sendTestSms(String number, String message) async {
    try {
      if (_permissions[Permission.sms]?.isGranted != true) {
        throw 'SMS permission is not granted. Please enable it in settings.';
      }
      await _smsService.sendSms(number, message);
    } catch (e) {
      AppLogger.error('Test SMS failed: $e');
      rethrow;
    }
  }

  void clearLogs() {
    _logs = [];
    notifyListeners();
  }

  Future<void> resetSettings() async {
    await StorageService.clearAll();
    _serverService.updateSettings(
      port: StorageService.port,
    );
    notifyListeners();
  }
}
