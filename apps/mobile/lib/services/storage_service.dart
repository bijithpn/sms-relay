import 'package:hive_flutter/hive_flutter.dart';
import '../core/constants.dart';

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

  static int get port => settingsBox.get('port', defaultValue: int.parse(AppConstants.defaultPort));
  static set port(int value) => settingsBox.put('port', value);
  
  static String get tunnelUrl => settingsBox.get('tunnelUrl', defaultValue: '');
  static set tunnelUrl(String value) => settingsBox.put('tunnelUrl', value);

  static String get syncUrl => settingsBox.get('syncUrl', defaultValue: '');
  static set syncUrl(String value) => settingsBox.put('syncUrl', value);

  static bool get autoSync => settingsBox.get('autoSync', defaultValue: false);
  static set autoSync(bool value) => settingsBox.put('autoSync', value);
}
