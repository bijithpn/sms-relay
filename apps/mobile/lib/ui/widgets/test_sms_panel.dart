import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../state/app_state.dart';

class TestSmsPanel extends StatefulWidget {
  const TestSmsPanel({super.key});

  @override
  State<TestSmsPanel> createState() => _TestSmsPanelState();
}

class _TestSmsPanelState extends State<TestSmsPanel> {
  final _numberController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleSend() async {
    final state = context.read<AppState>();
    final number = _numberController.text.trim();
    final message = _messageController.text.trim();

    if (number.isEmpty || message.isEmpty) {
      _showFeedback('Please enter both number and message', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      await state.sendTestSms(number, message);
      _showFeedback('SMS Queued Successfully!', isError: false);
      _messageController.clear();
    } catch (e) {
      _showFeedback(e.toString().replaceAll('Exception: ', ''), isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showFeedback(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: isError ? Colors.red : AppTheme.mistralOrange,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Quick Test Message',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppTheme.mistralBlack),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _numberController,
              style: const TextStyle(color: AppTheme.mistralBlack),
              decoration: const InputDecoration(
                labelText: 'Recipient Number',
                labelStyle: TextStyle(color: Color(0xFF3C3C3C)),
                hintText: '+91XXXXXXXXXX',
                prefixIcon: Icon(Icons.phone_android, size: 20, color: AppTheme.mistralOrange),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _messageController,
              style: const TextStyle(color: AppTheme.mistralBlack),
              decoration: const InputDecoration(
                labelText: 'Message Body',
                labelStyle: TextStyle(color: Color(0xFF3C3C3C)),
                hintText: 'Type your test message...',
                prefixIcon: Icon(Icons.message_outlined, size: 20, color: AppTheme.mistralOrange),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleSend,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.mistralBlack,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text('DISPATCH SMS', style: TextStyle(fontWeight: FontWeight.w400, letterSpacing: 1.1)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _numberController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
