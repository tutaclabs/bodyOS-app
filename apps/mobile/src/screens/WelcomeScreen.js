import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../ui/theme';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen({ onGetStarted, currentSlide = 1, totalSlides = 3, backgroundImage }) {
  return (
    <View style={styles.container}>
      <View style={styles.backgroundMask}>
        {backgroundImage ? (
          <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay} />
          </ImageBackground>
        ) : (
          <View style={styles.backgroundPlaceholder}>
            <View style={styles.imageOverlay} />
          </View>
        )}
        <View style={styles.gradientOverlay}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientMiddle} />
          <View style={styles.gradientBottom} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Start your journey towards better health today!
        </Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Accurate tracking, insightful analytics, and personalized tips, stay informed about your health like never before.
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>Comprehensive Wellness Monitoring</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>Personalized Health Insights</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>Real-Time Progress Tracking</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onGetStarted}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>

        <View style={styles.slideIndicator}>
          {[1, 2, 3].map((slide) => (
            <View
              key={slide}
              style={[
                styles.dot,
                slide === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#FFFFFF',
  },
  backgroundMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  backgroundPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#1E293B',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.458,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  gradientMiddle: {
    position: 'absolute',
    top: height * 0.458,
    left: 0,
    width: width,
    height: height * 0.485,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  gradientBottom: {
    position: 'absolute',
    top: height * 0.943,
    left: 0,
    width: width,
    height: height * 0.057,
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  contentContainer: {
    position: 'absolute',
    left: 24,
    top: height * 0.482,
    width: width - 48,
    padding: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 18,
    lineHeight: 36,
    width: '100%',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FAFAFA',
    lineHeight: 24,
    marginBottom: 20,
    width: '100%',
  },
  benefitsContainer: {
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFE595',
    marginRight: 12,
    width: 16,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FAFAFA',
    flex: 1,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: theme.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  slideIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    width: 34,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B3B3B3',
  },
  dotActive: {
    backgroundColor: '#FFE595',
    width: 6,
    height: 6,
  },
});
