# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# OpenTelemetry - missing AutoValue annotations at compile time
-dontwarn com.google.auto.value.**
-dontwarn io.opentelemetry.**

# Keep OpenTelemetry classes that reference AutoValue
-keep class io.opentelemetry.sdk.logs.** { *; }
-keep class io.opentelemetry.sdk.** { *; }

# Add any project specific keep options here:
