import { gasProvider } from './gasProvider';
import { IDataProvider } from './dataProvider';

// Initialize the provider
gasProvider.init();

export const dataProvider: IDataProvider = gasProvider;
