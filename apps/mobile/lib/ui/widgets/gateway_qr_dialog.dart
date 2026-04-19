import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import '../../state/app_state.dart';

class GatewayQrDialog extends StatelessWidget {
  const GatewayQrDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    
    final qrData = json.encode({
      'url': state.localIp != null ? 'http://${state.localIp}:3001' : 'http://local:3001',
      'port': 3001,
      'type': 'sms-gateway-node'
    });

    return AlertDialog(
      title: const Text('Gateway Connection QR'),
      content: SizedBox(
        width: 250,
        height: 300,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Scan this from your web dashboard to link this gateway.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: QrImageView(
                data: qrData,
                version: QrVersions.auto,
                size: 200.0,
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }
}
