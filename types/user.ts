import { Role } from "./role";

export interface User {
    id: number;
  
    username: string;
  
    isAdmin: boolean;

    isBlocked: boolean;
  

    fullName: string;
  

    email: string;

    platformId: string;
  

    picture: string;
  
    
    isGoogleUser: boolean;
  
    
    isFacebookUser: boolean;
  
    
    isAppleUser: boolean;
  
   
    isWebsiteUser: boolean;
  
    
    isEmailVerified: boolean;
  
   
    verificationToken: string;
  
   
    lastLogin: Date;
  
   
    createdAt: Date;
  
   
    updatedAt: Date;

    roles: Role[];
}