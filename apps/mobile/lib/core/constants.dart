import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'SMS Gateway';
  static const String smsChannel = 'com.smsgateway/sms';
  static const String statusChannel = 'com.smsgateway/sms_status';

  static const String defaultPort = '8080';

  // Status Colors
  static const Color activeColor = Colors.green;
  static const Color errorColor = Colors.red;
  static const Color pendingColor = Colors.amber;
  static const Color idleColor = Colors.grey;
}
