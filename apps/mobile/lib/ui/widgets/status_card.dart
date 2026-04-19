import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../state/app_state.dart';
import 'scanner_screen.dart';
import 'gateway_qr_dialog.dart';

class StatusCard extends StatelessWidget {
  const StatusCard({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Column(
      children: [
        _buildMainStatus(context, state),
        const SizedBox(height: 16),
        _buildConnectionGrid(context, state),
        const SizedBox(height: 16),
        _buildSyncSection(context, state),
      ],
    );
  }

  Widget _buildMainStatus(BuildContext context, AppState state) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('System Status', style: TextStyle(color: Color(0xFF3C3C3C), fontSize: 12, fontWeight: FontWeight.w400)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: state.isServerRunning ? AppTheme.mistralOrange : Colors.red,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      state.isServerRunning ? 'SERVER ONLINE' : 'SERVER OFFLINE',
                      style: const TextStyle(fontWeight: FontWeight.w400, fontSize: 16, color: AppTheme.mistralBlack),
                    ),
                  ],
                ),
              ],
            ),
            Switch.adaptive(
              value: state.isServerRunning,
              onChanged: (_) => state.toggleServer(),
              activeColor: AppTheme.mistralOrange,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionGrid(BuildContext context, AppState state) {
    final endpoint = '${state.localIp ?? 'Detection...'}';
    return _buildInfoCard(
      context,
      'Network Connection',
      state.localIp != null ? 'Connected to $endpoint' : 'Searching for Network...',
      Icons.wifi_tethering,
      () {
        if (state.localIp != null) {
          Clipboard.setData(ClipboardData(text: 'http://$endpoint:3001/send-sms'));
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('API Endpoint copied to clipboard'), duration: Duration(seconds: 1)),
          );
        }
      },
      subtitle: 'Port 3001 is used by default',
    );
  }

  Widget _buildInfoCard(BuildContext context, String label, String value, IconData icon, VoidCallback onTap, {String? subtitle, bool isCompact = false}) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(icon, size: 20, color: AppTheme.mistralOrange),
                  if (subtitle != null) const Icon(Icons.copy, size: 12, color: Colors.grey),
                ],
              ),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(color: Color(0xFF3C3C3C), fontSize: 11, fontWeight: FontWeight.w400)),
              const SizedBox(height: 2),
              Text(value, style: TextStyle(fontWeight: FontWeight.w400, fontSize: isCompact ? 14 : 15, color: AppTheme.mistralBlack)),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 9)),
              ]
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSyncSection(BuildContext context, AppState state) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Backend Integration', style: TextStyle(fontWeight: FontWeight.w400, color: AppTheme.mistralBlack)),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.delete_sweep_outlined, color: Colors.grey, size: 20),
                      onPressed: () => _showResetConfirmation(context, state),
                      tooltip: 'Reset Settings',
                    ),
                    IconButton(
                      icon: const Icon(Icons.qr_code_scanner, color: AppTheme.mistralOrange),
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScannerScreen())),
                      tooltip: 'Scan Sync URL',
                    ),
                    IconButton(
                      icon: const Icon(Icons.qr_code, color: AppTheme.sunshine700),
                      onPressed: () => showDialog(context: context, builder: (_) => const GatewayQrDialog()),
                      tooltip: 'Show Gateway QR',
                    ),
                  ],
                ),
              ],
            ),
            const Divider(color: AppTheme.blockGold),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Sync Endpoint (Dashboard URL)', style: TextStyle(fontSize: 12, color: Color(0xFF3C3C3C))),
              subtitle: Text(state.syncUrl.isEmpty ? 'Not set (Scan QR Code)' : state.syncUrl, style: const TextStyle(fontWeight: FontWeight.w400)),
              trailing: state.isSyncing
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(AppTheme.mistralOrange)))
                : IconButton(icon: const Icon(Icons.sync, size: 18, color: AppTheme.mistralBlack), onPressed: state.syncWithBackend),
              onTap: () => _showEditDialog(context, 'Update Sync URL', state.syncUrl, (v) => state.updateSyncUrl(v)),
            ),
          ],
        ),
      ),
    );
  }

  void _showResetConfirmation(BuildContext context, AppState state) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.warmIvory,
        title: const Text('Reset All Settings?', style: TextStyle(color: AppTheme.mistralBlack, fontWeight: FontWeight.w400)),
        content: const Text('This will clear all saved URLs and configurations.', style: TextStyle(color: AppTheme.mistralBlack)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: AppTheme.mistralBlack))),
          TextButton(
            onPressed: () {
              state.resetSettings();
              Navigator.pop(context);
            },
            child: const Text('Reset', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, String title, String initialValue, Function(String) onSave, {bool isNumber = false}) {
    final controller = TextEditingController(text: initialValue);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.warmIvory,
        title: Text(title, style: const TextStyle(color: AppTheme.mistralBlack, fontWeight: FontWeight.w400)),
        content: TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          autofocus: true,
          style: const TextStyle(color: AppTheme.mistralBlack),
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: AppTheme.mistralBlack))),
          TextButton(
            onPressed: () {
              onSave(controller.text);
              Navigator.pop(context);
            },
            child: const Text('Save', style: TextStyle(color: AppTheme.mistralOrange)),
          ),
        ],
      ),
    );
  }
}
