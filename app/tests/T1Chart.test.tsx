import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import T1Chart from '../components/T1Chart';
import { T1DataPoint } from '../store/t1Slice';
import * as useHasHydratedHook from '../hooks/useHasHydrated';

jest.mock('echarts-for-react', () => {
  return jest.fn(() => React.createElement('div', { 'data-testid': 'echarts-mock' }));
});


const mockStore = configureStore([]);

const mockInitialData: T1DataPoint[] = [
  { timestamp: Date.now(), value: 1.2 },
  { timestamp: Date.now() + 1000, value: 1.5 },
];

describe('T1Chart', () => {
  let useHasHydratedSpy: jest.SpyInstance;

  beforeEach(() => {
    useHasHydratedSpy = jest.spyOn(useHasHydratedHook, 'useHasHydrated');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithStore = (store: any, initialData = mockInitialData) =>
    render(
      <Provider store={store}>
        <T1Chart initialData={initialData} />
      </Provider>
    );

  it('does not render before hydration', () => {
    useHasHydratedSpy.mockReturnValue(false);

    const store = mockStore({ t1: { rawData: [], loading: false, error: null } });
    renderWithStore(store);
    expect(screen.queryByTestId('echarts-mock')).toBeNull();
  });

  it('shows loading message when loading', () => {
    useHasHydratedSpy.mockReturnValue(true);

    const store = mockStore({ t1: { rawData: [], loading: true, error: null } });
    renderWithStore(store);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    useHasHydratedSpy.mockReturnValue(true);

    const store = mockStore({ t1: { rawData: [], loading: false, error: 'Failed to fetch' } });
    renderWithStore(store);

    expect(screen.getByText(/Error: Failed to fetch/)).toBeInTheDocument();
  });

  it('shows "No data Available" when rawData is empty', () => {
    useHasHydratedSpy.mockReturnValue(true);

    const store = mockStore({ t1: { rawData: [], loading: false, error: null } });
    renderWithStore(store);

    expect(screen.getByText('No data Available')).toBeInTheDocument();
  });

  it('renders chart when data is present', async () => {
    useHasHydratedSpy.mockReturnValue(true);

    const store = mockStore({ t1: { rawData: mockInitialData, loading: false, error: null } });
    renderWithStore(store);

    await waitFor(() => {
      expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
    });
  });
});
