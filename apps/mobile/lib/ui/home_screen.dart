import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../state/app_state.dart';
import '../utils/logger.dart';
import 'widgets/status_card.dart';
import 'widgets/permissions_panel.dart';
import 'widgets/logs_panel.dart';
import 'widgets/test_sms_panel.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  StreamSubscription? _logSubscription;
  String? _lastToastMessage;
  DateTime? _lastToastTime;

  @override
  void initState() {
    super.initState();
    // Listen to logs to show toasts with deduplication
    _logSubscription = AppLogger.logs.listen((entry) {
      if (!mounted) return;
      
      if (entry.type == LogType.success || entry.type == LogType.error) {
        final now = DateTime.now();
        // Prevent showing the exact same message within 2 seconds
        if (_lastToastMessage == entry.message && 
            _lastToastTime != null && 
            now.difference(_lastToastTime!).inSeconds < 2) {
          return;
        }
        
        _lastToastMessage = entry.message;
        _lastToastTime = now;
        _showToast(entry);
      }
    });
  }

  @override
  void dispose() {
    _logSubscription?.cancel();
    super.dispose();
  }

  void _showToast(LogEntry entry) {
    if (!mounted) return;

    final isError = entry.type == LogType.error;
    
    // Clear any existing snacks before showing a new one to avoid queuing
    ScaffoldMessenger.of(context).hideCurrentSnackBar();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(entry.message, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w400))),
          ],
        ),
        backgroundColor: isError ? Colors.red : AppTheme.mistralOrange,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName, style: TextStyle(fontWeight: FontWeight.w400, letterSpacing: 1.1, color: AppTheme.mistralBlack)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.mistralBlack),
            onPressed: () => context.read<AppState>().syncWithBackend(),
            tooltip: 'Manual Sync',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppTheme.warmIvory,
              AppTheme.warmIvory.withOpacity(0.8),
            ],
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          physics: const BouncingScrollPhysics(),
          children: [
            const StatusCard(),
            const SizedBox(height: 20),
            _buildSectionHeader('System Controls'),
            const PermissionsPanel(),
            const SizedBox(height: 16),
            const TestSmsPanel(),
            const SizedBox(height: 28),
            _buildSectionHeader('Live Activity Stream'),
            const LogsPanel(),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w400,
          color: Color(0xFF3C3C3C),
          letterSpacing: 1.5,
        ),
      ),
    );
  }
}
