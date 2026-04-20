import 'package:hive_flutter/hive_flutter.dart';

class StorageService {
  static const String settingsBoxName = 'settings';
  static const String logsBoxName = 'logs';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(settingsBoxName);
    // Hive.openBox(logsBoxName) could be for persistent history if desired
  }

  static Box get settingsBox => Hive.box(settingsBoxName);

  static Future<void> clearAll() async {
    await settingsBox.clear();
  }

  static String get syncUrl => settingsBox.get('syncUrl', defaultValue: '');
  static set syncUrl(String value) => settingsBox.put('syncUrl', value);

  static String get adminSecret => settingsBox.get('adminSecret', defaultValue: '');
  static set adminSecret(String value) => settingsBox.put('adminSecret', value);
}
