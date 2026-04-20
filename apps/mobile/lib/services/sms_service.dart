import 'dart:async';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import '../core/constants.dart';
import '../utils/logger.dart';

class SmsService {
  static const MethodChannel _methodChannel = MethodChannel(AppConstants.smsChannel);
  static const EventChannel _eventChannel = EventChannel(AppConstants.statusChannel);
  
  final StreamController<Map<String, dynamic>> _statusController = StreamController.broadcast();
  Stream<Map<String, dynamic>> get statusStream => _statusController.stream;

  SmsService() {
    _eventChannel.receiveBroadcastStream().listen((data) {
      final map = Map<String, dynamic>.from(data);
      _statusController.add(map);
      
      final id = map['id'];
      final status = map['status'];
      final type = map['type'];
      
      if (type == 'sent_report') {
        if (status == 'sent') {
          AppLogger.success('SMS $id sent successfully to network');
        } else {
          AppLogger.error('SMS $id failed to send: $status');
        }
      } else if (type == 'delivery_report') {
        AppLogger.success('SMS $id delivered to recipient');
      }
    });
  }

  Future<String> sendSms(String number, String message, {String? id}) async {
    final effectiveId = id ?? const Uuid().v4().substring(0, 8);
    try {
      AppLogger.info('Queuing SMS to $number: $message (ID: $effectiveId)');
      await _methodChannel.invokeMethod('sendSms', {
        'number': number,
        'message': message,
        'id': effectiveId,
      });
      return effectiveId;
    } on PlatformException catch (e) {
      AppLogger.error('Failed to trigger SMS: ${e.message}');
      rethrow;
    }
  }
}
