import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../state/app_state.dart';

class PermissionsPanel extends StatelessWidget {
  const PermissionsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return ExpansionTile(
      tilePadding: const EdgeInsets.symmetric(horizontal: 8),
      title: const Text('System Permissions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      leading: const Icon(Icons.security, color: Colors.blueGrey, size: 20),
      subtitle: Text(
        _allGranted(state) ? 'All permissions active' : 'Action required',
        style: TextStyle(
          fontSize: 12, 
          color: _allGranted(state) ? AppConstants.activeColor : AppConstants.errorColor
        ),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            children: [
              _buildPermissionRow('SMS Access', state.permissions[Permission.sms] ?? PermissionStatus.denied),
              _buildPermissionRow('Phone State', state.permissions[Permission.phone] ?? PermissionStatus.denied),
              _buildPermissionRow('Camera', state.permissions[Permission.camera] ?? PermissionStatus.denied),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  onPressed: state.requestPermissions,
                  icon: const Icon(Icons.refresh, size: 18),
                  label: const Text('Check Permissions'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  bool _allGranted(AppState state) {
    return (state.permissions[Permission.sms]?.isGranted ?? false) &&
           (state.permissions[Permission.phone]?.isGranted ?? false) &&
           (state.permissions[Permission.camera]?.isGranted ?? false);
  }

  Widget _buildPermissionRow(String name, PermissionStatus status) {
    final bool isGranted = status.isGranted;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Icon(
            isGranted ? Icons.check_circle : Icons.error,
            color: isGranted ? AppConstants.activeColor : AppConstants.errorColor,
            size: 16,
          ),
          const SizedBox(width: 12),
          Text(name, style: const TextStyle(fontSize: 13)),
          const Spacer(),
          Text(
            isGranted ? 'ACTIVE' : 'DENIED',
            style: TextStyle(
              fontSize: 11, 
              fontWeight: FontWeight.bold,
              color: isGranted ? AppConstants.activeColor : AppConstants.errorColor,
            ),
          ),
        ],
      ),
    );
  }
}
