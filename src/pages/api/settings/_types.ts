export type Settings = {
  siteTitle: string, 
  siteDescription?: string, 
  siteFavicon?: string, 
  siteFaviconSVG?: string, 
  homepageLogo?: string, 
  siteLogo?: string ,
  siteBg?: string,
  spotifyRefreshToken?:string,
  section?:string
}
export type SpotifyImage = {
    url: string;
    height: number;
    width: number;
}
export type  SpotifyUserProfile = {
    display_name: string;
    email: string;
    external_urls: { spotify: string; };
    href: string;
    id: string;
    images: SpotifyImage[];
    uri: string;
}
export type SpotifyData = {
  appId : string, 
  requestUrl?: string, 
  profileData?: SpotifyUserProfile
}
