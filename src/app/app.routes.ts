import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	},
	{
		path: 'home',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/home.page').then((m) => m.HomePageComponent)
	},
	{
		path: 'browse',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/browse.page').then((m) => m.BrowsePageComponent)
	},
	{
  path: 'register',
  canActivate: [guestGuard],
  loadComponent: () =>
    import('./pages/register.page').then(m => m.SignupComponent)
},
	{  path: 'login',
  canActivate: [guestGuard],
  loadComponent: () =>
    import('./pages/login.page').then((m) => m.LoginPage)
},
	{
		path: 'book/:id',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/book-detail.page').then((m) => m.BookDetailPageComponent)
	},
	{
		path: 'sell',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/sell.page').then((m) => m.SellPageComponent)
	},
	{
		path: 'my-listings',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/my-listings.page').then((m) => m.MyListingsPageComponent)
	},
	{
		path: 'cart',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/cart.page').then((m) => m.CartPageComponent)
	},
	{
		path: 'payment-options',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/payment-options.page').then((m) => m.PaymentOptionsPageComponent)
	},
	{
		path: 'profile/:id',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/profile.page').then((m) => m.ProfilePageComponent)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
