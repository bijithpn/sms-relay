package com.smsgateway.mobile

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.telephony.SmsManager
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val SMS_CHANNEL = "com.smsgateway/sms"
    private val STATUS_CHANNEL = "com.smsgateway/sms_status"
    
    private val SENT_ACTION = "SMS_SENT"
    private val DELIVERED_ACTION = "SMS_DELIVERED"

    private var eventSink: EventChannel.EventSink? = null

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, SMS_CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "sendSms") {
                val number = call.argument<String>("number")
                val message = call.argument<String>("message")
                val id = call.argument<String>("id")

                if (number != null && message != null && id != null) {
                    sendSMS(number, message, id)
                    result.success(true)
                } else {
                    result.error("INVALID_ARGUMENTS", "Number, message, or ID is null", null)
                }
            } else {
                result.notImplemented()
            }
        }

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, STATUS_CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, sink: EventChannel.EventSink?) {
                    eventSink = sink
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                }
            }
        )
    }

    private fun sendSMS(number: String, message: String, id: String) {
        val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            this.getSystemService(SmsManager::class.java)
        } else {
            SmsManager.getDefault()
        }

        val sentIntent = PendingIntent.getBroadcast(
            this, id.hashCode(),
            Intent(SENT_ACTION).putExtra("id", id),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val deliveredIntent = PendingIntent.getBroadcast(
            this, id.hashCode(),
            Intent(DELIVERED_ACTION).putExtra("id", id),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val sentReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val msgId = intent?.getStringExtra("id") ?: id
                val status = when (resultCode) {
                    RESULT_OK -> "sent"
                    else -> "failed_to_send"
                }
                eventSink?.success(mapOf("id" to msgId, "status" to status, "type" to "sent_report"))
                context?.unregisterReceiver(this)
            }
        }

        val deliveredReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val msgId = intent?.getStringExtra("id") ?: id
                eventSink?.success(mapOf("id" to msgId, "status" to "delivered", "type" to "delivery_report"))
                context?.unregisterReceiver(this)
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(sentReceiver, IntentFilter(SENT_ACTION), Context.RECEIVER_EXPORTED)
            registerReceiver(deliveredReceiver, IntentFilter(DELIVERED_ACTION), Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(sentReceiver, IntentFilter(SENT_ACTION))
            registerReceiver(deliveredReceiver, IntentFilter(DELIVERED_ACTION))
        }

        try {
            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                val sentIntents = ArrayList<PendingIntent>()
                val deliveredIntents = ArrayList<PendingIntent>()
                for (i in parts.indices) {
                    sentIntents.add(sentIntent)
                    deliveredIntents.add(deliveredIntent)
                }
                smsManager.sendMultipartTextMessage(number, null, parts, sentIntents, deliveredIntents)
            } else {
                smsManager.sendTextMessage(number, null, message, sentIntent, deliveredIntent)
            }
        } catch (e: Exception) {
            eventSink?.success(mapOf("id" to id, "status" to "failed_to_send", "type" to "sent_report"))
        }
    }
}
