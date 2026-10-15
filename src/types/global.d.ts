declare module '*.css' {
  const styles: {
    [className: string]: string;
    foo: string;
    bar: string;
  };
  export default styles; 
}