import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
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
                const Text('System Status', style: TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: state.isServerRunning ? AppConstants.activeColor : AppConstants.errorColor,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      state.isServerRunning ? 'SERVER ONLINE' : 'SERVER OFFLINE',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
              ],
            ),
            Switch.adaptive(
              value: state.isServerRunning,
              onChanged: (_) => state.toggleServer(),
              activeTrackColor: AppConstants.activeColor.withAlpha(128),
              activeThumbColor: AppConstants.activeColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionGrid(BuildContext context, AppState state) {
    return Row(
      children: [
        Expanded(
          child: _buildInfoCard(
            context,
            'Local Port',
            state.port.toString(),
            Icons.lan,
            () => _showEditDialog(context, 'Update Port', state.port.toString(), (v) => state.updatePort(int.parse(v)), isNumber: true),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildInfoCard(
            context,
            'API Security',
            '${state.apiKey.substring(0, 2)}***',
            Icons.lock_outline,
            () => _showEditDialog(context, 'Update API Key', state.apiKey, (v) => state.updateApiKey(v)),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard(BuildContext context, String label, String value, IconData icon, VoidCallback onTap) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 20, color: Colors.blueGrey),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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
                const Text('Backend Integration', style: TextStyle(fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.qr_code_scanner, color: Colors.blue),
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScannerScreen())),
                      tooltip: 'Scan Sync URL',
                    ),
                    IconButton(
                      icon: const Icon(Icons.qr_code, color: Colors.purpleAccent),
                      onPressed: () => showDialog(context: context, builder: (_) => const GatewayQrDialog()),
                      tooltip: 'Show Gateway QR',
                    ),
                  ],
                ),
              ],
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Public URL / Tunnel', style: TextStyle(fontSize: 12, color: Colors.grey)),
              subtitle: Text(state.publicUrl.isEmpty ? 'Not set' : state.publicUrl, style: const TextStyle(fontWeight: FontWeight.w500)),
              trailing: state.publicUrl.isNotEmpty 
                ? IconButton(icon: const Icon(Icons.copy, size: 18), onPressed: () => Clipboard.setData(ClipboardData(text: state.publicUrl)))
                : null,
              onTap: () => _showEditDialog(context, 'Update Tunnel URL', state.publicUrl, (v) => state.updatePublicUrl(v)),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Sync Endpoint', style: TextStyle(fontSize: 12, color: Colors.grey)),
              subtitle: Text(state.syncUrl.isEmpty ? 'Not set' : state.syncUrl, style: const TextStyle(fontWeight: FontWeight.w500)),
              trailing: state.isSyncing 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : IconButton(icon: const Icon(Icons.sync, size: 18), onPressed: state.syncWithBackend),
              onTap: () => _showEditDialog(context, 'Update Sync URL', state.syncUrl, (v) => state.updateSyncUrl(v)),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Auto-Sync Status', style: TextStyle(fontSize: 13)),
                Switch.adaptive(
                  value: state.autoSync,
                  onChanged: (v) => state.toggleAutoSync(v),
                  activeThumbColor: Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(BuildContext context, String title, String initialValue, Function(String) onSave, {bool isNumber = false}) {
    final controller = TextEditingController(text: initialValue);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          autofocus: true,
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              onSave(controller.text);
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
