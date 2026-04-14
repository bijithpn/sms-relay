import 'dart:convert';
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'sms_service.dart';
import '../utils/logger.dart';

class ServerService {
  final SmsService _smsService;
  HttpServer? _server;
  String _apiKey;
  int _port;

  ServerService(this._smsService, {String? apiKey, int? port})
      : _apiKey = apiKey ?? 'secret-api-key',
        _port = port ?? 8080;

  bool get isRunning => _server != null;
  int get port => _port;
  String get apiKey => _apiKey;

  void updateSettings({String? apiKey, int? port}) {
    if (apiKey != null) _apiKey = apiKey;
    if (port != null) _port = port;
  }

  Future<void> start() async {
    if (_server != null) return;

    final router = Router();

    router.post('/send-sms', (Request request) async {
      AppLogger.request('POST /send-sms from ${request.context['shelf.io.connection_info']}');
      
      try {
        final payload = await request.readAsString();
        final body = json.decode(payload);
        
        final number = body['number'];
        final message = body['message'];

        if (number == null || message == null) {
          return Response.badRequest(
            body: json.encode({'error': 'Missing number or message'}),
            headers: {'content-type': 'application/json'},
          );
        }

        final id = await _smsService.sendSms(number, message);
        
        return Response.ok(
          json.encode({'status': 'sent', 'id': id}),
          headers: {'content-type': 'application/json'},
        );
      } catch (e) {
        AppLogger.error('Server error processing request: $e');
        return Response.internalServerError(
          body: json.encode({'error': e.toString()}),
          headers: {'content-type': 'application/json'},
        );
      }
    });

    // Endpoint to update settings remotely
    router.post('/settings', (Request request) async {
      AppLogger.request('POST /settings from ${request.context['shelf.io.connection_info']}');
      try {
        final payload = await request.readAsString();
        final body = json.decode(payload);
        
        // We return the body so the AppState can handle the persistence and logic
        return Response.ok(
          json.encode({'status': 'received', 'updated': body}),
          headers: {'content-type': 'application/json'},
        );
      } catch (e) {
        return Response.internalServerError(body: json.encode({'error': e.toString()}));
      }
    });

    final handler = Pipeline()
        .addMiddleware(logRequests())
        .addMiddleware(_corsMiddleware()) // Enable CORS for Web Browsers
        .addMiddleware(_authMiddleware(_apiKey))
        .addHandler((Request request) {
      if (request.method == 'OPTIONS') {
        return Response.ok('', headers: _corsHeaders());
      }
      return router.call(request);
    });

    try {
      _server = await io.serve(handler, InternetAddress.anyIPv4, _port);
      AppLogger.server('Server running on port ${_server!.port}');
    } catch (e) {
      AppLogger.error('Failed to start server: $e');
      rethrow;
    }
  }

  Future<void> stop() async {
    if (_server == null) return;
    await _server!.close(force: true);
    _server = null;
    AppLogger.server('Server stopped');
  }

  Map<String, String> _corsHeaders() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization, Accept',
    };
  }

  Middleware _corsMiddleware() {
    return (innerHandler) {
      return (request) async {
        if (request.method == 'OPTIONS') {
          return Response.ok('', headers: _corsHeaders());
        }
        final response = await innerHandler(request);
        return response.change(headers: _corsHeaders());
      };
    };
  }

  Middleware _authMiddleware(String validKey) {
    return (innerHandler) {
      return (request) async {
        final authHeader = request.headers['Authorization'];
        if (authHeader == null || !authHeader.startsWith('Bearer ') || authHeader.substring(7) != validKey) {
          AppLogger.error('Unauthorized request: ${request.requestedUri}');
          return Response.forbidden(
            json.encode({'error': 'Unauthorized'}),
            headers: {'content-type': 'application/json'},
          );
        }
        return innerHandler(request);
      };
    };
  }
}
