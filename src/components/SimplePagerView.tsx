import React, { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent, ViewStyle } from "react-native";

const { width } = Dimensions.get("window");

interface SimplePagerViewProps {
  style?: ViewStyle;
  className?: string;
  initialPage?: number;
  onPageSelected?: (event: { nativeEvent: { position: number } }) => void;
  children: React.ReactNode[];
}

export interface SimplePagerViewRef {
  setPage: (page: number) => void;
}

const SimplePagerView = forwardRef<SimplePagerViewRef, SimplePagerViewProps>(
  ({ style, className, initialPage = 0, onPageSelected, children }, ref) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const scrollViewRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        setCurrentPage(page);
        scrollViewRef.current?.scrollTo({ x: page * width, animated: true });
        setTimeout(() => {
          onPageSelected?.({ nativeEvent: { position: page } });
        }, 100);
      },
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      const page = Math.round(contentOffset.x / width);
      if (page !== currentPage) {
        setCurrentPage(page);
        onPageSelected?.({ nativeEvent: { position: page } });
      }
    };

    return (
      <ScrollView
        ref={scrollViewRef}
        style={style}
        className={className}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      >
        {React.Children.map(children, (child) => (
          <View style={{ width }}>
            {child}
          </View>
        ))}
      </ScrollView>
    );
  }
);

export default SimplePagerView;