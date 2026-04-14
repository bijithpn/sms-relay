import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../state/app_state.dart';
import '../../utils/logger.dart';

class LogsPanel extends StatelessWidget {
  const LogsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Real-time Logs',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: AppTheme.mistralBlack),
                ),
                TextButton(
                  onPressed: state.clearLogs,
                  child: const Text('Clear', style: TextStyle(color: AppTheme.mistralOrange)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              height: 300,
              decoration: BoxDecoration(
                color: AppTheme.mistralBlack,
                borderRadius: BorderRadius.zero,
              ),
              child: state.logs.isEmpty
                  ? const Center(child: Text('No logs yet', style: TextStyle(color: Colors.grey)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(8),
                      itemCount: state.logs.length,
                      itemBuilder: (context, index) {
                        final log = state.logs[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2.0),
                          child: RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 12,
                                height: 1.4,
                              ),
                              children: [
                                TextSpan(
                                  text: '${log.formattedTimestamp} ',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                                TextSpan(
                                  text: '${log.prefix} ',
                                  style: TextStyle(
                                    color: _getLogColor(log.type),
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                TextSpan(
                                  text: log.message,
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getLogColor(LogType type) {
    switch (type) {
      case LogType.server: return AppTheme.sunshine700;
      case LogType.request: return AppTheme.blockGold;
      case LogType.success: return AppTheme.mistralOrange;
      case LogType.error: return Colors.red;
      case LogType.info: return Colors.grey;
    }
  }
}
