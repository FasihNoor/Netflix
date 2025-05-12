import { Breakpoint } from '../config/breakpoints';

export type Maybe<T> = T | null;

export type Dimension = {
  height: number;
  width: number;
};

export type DimensionDetail = {
  dimension: Dimension;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export type Genre = {
  id: number;
  name: string;
};

export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv'
}

export type Media = {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster: string;
  poster_path?: string;
  banner: string;
  rating: number;
  vote_average?: number;
  genre: Genre[];
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  imdb_id?: string;
};

export type ImageType = 'poster' | 'original';

export type Section = {
  heading: string;
  endpoint: string;
  defaultCard?: boolean;
  topList?: boolean;
};
