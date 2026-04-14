import 'dart:async';
import 'package:intl/intl.dart';

enum LogType { server, request, success, error, info }

class LogEntry {
  final String message;
  final DateTime timestamp;
  final LogType type;

  LogEntry(this.message, this.type) : timestamp = DateTime.now();

  String get formattedTimestamp => DateFormat('HH:mm:ss').format(timestamp);
  
  String get prefix {
    switch (type) {
      case LogType.server: return '[SERVER]';
      case LogType.request: return '[REQUEST]';
      case LogType.success: return '[SUCCESS]';
      case LogType.error: return '[ERROR]';
      case LogType.info: return '[INFO]';
    }
  }
}

class AppLogger {
  static final StreamController<LogEntry> _controller = StreamController<LogEntry>.broadcast();
  static Stream<LogEntry> get logs => _controller.stream;

  static void log(String message, [LogType type = LogType.info]) {
    final entry = LogEntry(message, type);
    _controller.add(entry);
  }
  
  static void server(String message) => log(message, LogType.server);
  static void request(String message) => log(message, LogType.request);
  static void success(String message) => log(message, LogType.success);
  static void error(String message) => log(message, LogType.error);
  static void info(String message) => log(message, LogType.info);
}
