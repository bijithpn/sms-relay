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
  
  AppState() {
    _serverService = ServerService(_smsService, 
      apiKey: StorageService.apiKey, 
      port: StorageService.port
    );
    
    _listenToLogs();
    _checkPermissions();
    
    // Auto-sync on startup if enabled
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (autoSync) syncWithBackend();
    });
  }

  // Getters
  List<LogEntry> get logs => _logs;
  bool get isServerRunning => _serverService.isRunning;
  int get port => _serverService.port;
  String get apiKey => _serverService.apiKey;
  String get publicUrl => StorageService.tunnelUrl;
  String get syncUrl => StorageService.syncUrl;
  bool get autoSync => StorageService.autoSync;
  bool get isSyncing => _isSyncing;
  Map<Permission, PermissionStatus> get permissions => _permissions;

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
      if (data['apiKey'] != null) updateApiKey(data['apiKey']);
      if (data['port'] != null) updatePort(int.parse(data['port'].toString()));
      AppLogger.success('Configuration updated via QR code');
    } catch (e) {
      // If not JSON, check if it's just a URL
      if (code.startsWith('http')) {
        updateSyncUrl(code);
        AppLogger.success('Sync URL updated via QR code');
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
      } else {
        await _serverService.start();
        AppLogger.success('Server started successfully');
        if (autoSync) await syncWithBackend();
      }
      notifyListeners();
    } catch (e) {
      AppLogger.error('Server action failed: $e');
    }
  }

  Future<void> syncWithBackend() async {
    if (syncUrl.isEmpty) {
      AppLogger.info('Backend Sync URL not set. Skipping sync.');
      return;
    }

    _isSyncing = true;
    notifyListeners();

    try {
      AppLogger.info('Syncing status with backend: $syncUrl');
      final response = await http.post(
        Uri.parse(syncUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'gateway_id': 'flutter_sms_gateway',
          'public_url': publicUrl,
          'local_port': port,
          'status': isServerRunning ? 'online' : 'offline',
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        AppLogger.success('Successfully synced with backend');
      } else {
        AppLogger.error('Backend sync failed: ${response.statusCode}');
      }
    } catch (e) {
      AppLogger.error('Error during backend sync: $e');
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  void updatePort(int port) {
    StorageService.port = port;
    _serverService.updateSettings(port: port);
    notifyListeners();
  }

  void updateApiKey(String key) {
    StorageService.apiKey = key;
    _serverService.updateSettings(apiKey: key);
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
}
