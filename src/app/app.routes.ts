import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home.page').then((m) => m.HomePageComponent)
	},
	{
		path: 'browse',
		loadComponent: () => import('./pages/browse.page').then((m) => m.BrowsePageComponent)
	},
	{  path: 'login',
  loadComponent: () =>
    import('./pages/login.page').then((m) => m.LoginPage)
},
	{
		path: 'book/:id',
		loadComponent: () => import('./pages/book-detail.page').then((m) => m.BookDetailPageComponent)
	},
	{
		path: 'sell',
		loadComponent: () => import('./pages/sell.page').then((m) => m.SellPageComponent)
	},
	{
		path: 'my-listings',
		loadComponent: () => import('./pages/my-listings.page').then((m) => m.MyListingsPageComponent)
	},
	{
		path: 'profile/:id',
		loadComponent: () => import('./pages/profile.page').then((m) => m.ProfilePageComponent)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
