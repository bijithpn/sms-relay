import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'core/theme.dart';
import 'services/storage_service.dart';
import 'state/app_state.dart';
import 'ui/home_screen.dart';

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  // Only used to keep the foreground service alive natively.
  // The main isolate handles the actual server logic via AppState.
}

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'sms_gateway_foreground',
    'SMS Gateway Service',
    description: 'This channel is used for important notifications.',
    importance: Importance.low,
  );

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'sms_gateway_foreground',
      initialNotificationTitle: 'SMS Gateway Service',
      initialNotificationContent: 'Running in background',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(
      autoStart: true,
      onForeground: onStart,
    ),
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Storage (Hive)
  await StorageService.init();

  // Clear previous connection URL on every start as requested
  // This prevents connection failures when the network or tunnel URL has changed
  StorageService.syncUrl = '';
  StorageService.tunnelUrl = '';

  await initializeService();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
      ],
      child: const SmsGatewayApp(),
    ),
  );
}

class SmsGatewayApp extends StatelessWidget {
  const SmsGatewayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SMS Gateway',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.mistralTheme,
      home: const HomeScreen(),
    );
  }
}
