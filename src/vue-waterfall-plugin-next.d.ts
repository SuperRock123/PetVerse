declare module 'vue-waterfall-plugin-next' {
  import { DefineComponent } from 'vue';

  export const LazyImg: DefineComponent<{
    src: string;
    placeholder?: string;
    error?: string;
    [key: string]: any;
  }>;

  export const Waterfall: DefineComponent<{
    list: any[];
    col?: number;
    gap?: number;
    [key: string]: any;
  }>;
}