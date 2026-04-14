import 'package:flutter/material.dart';

class AppTheme {
  // Mistral AI Design System Colors
  static const Color warmIvory = Color(0xFFFFFAEB);
  static const Color cream = Color(0xFFFFF0C2);
  static const Color mistralOrange = Color(0xFFFA520F);
  static const Color mistralBlack = Color(0xFF1F1F1F);
  static const Color sunshine700 = Color(0xFFFFA110);
  static const Color blockGold = Color(0xFFFFE295);

  static ThemeData get mistralTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: warmIvory,
      colorScheme: ColorScheme.light(
        primary: mistralOrange,
        onPrimary: Colors.white,
        secondary: sunshine700,
        onSecondary: Colors.white,
        surface: cream,
        onSurface: mistralBlack,
        error: Colors.red,
        onError: Colors.white,
      ),
      cardTheme: CardThemeData(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
        elevation: 0,
        color: cream,
        margin: EdgeInsets.zero,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: warmIvory,
        foregroundColor: mistralBlack,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: mistralBlack,
          fontSize: 20,
          fontWeight: FontWeight.w400,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: Color(0xFFE5E5E5)),
        ),
        filled: true,
        fillColor: warmIvory,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: mistralBlack,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w400,
            letterSpacing: 1.2,
          ),
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 82,
          fontWeight: FontWeight.w400,
          color: mistralBlack,
          letterSpacing: -2.05,
        ),
        headlineMedium: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w400,
          color: mistralBlack,
        ),
        bodyMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: mistralBlack,
        ),
        bodySmall: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: Color(0xFF3C3C3C),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: const Color(0xFF121212),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 4,
        color: const Color(0xFF1E1E1E),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF121212),
        elevation: 0,
        centerTitle: true,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: const Color(0xFF2A2A2A),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
