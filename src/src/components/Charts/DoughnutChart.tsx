import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { useBooleanState } from '../../hooks/useBooleanState';
import type { RA, WritableArray } from '../../utils/types';
import { writable } from '../../utils/types';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { EventsStore } from '../EventsStore';

Chart.register(DoughnutController, ArcElement, Tooltip);

export function DoughnutChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element | null {
  const calendars = React.useContext(CalendarsContext);
  const labels = useLabels(calendars);

  /**
   * In order for ChartJS to smoothly animate from one state to another rather
   * than re-render from scratch, need to mutate the data object rather than
   * give it a new one
   */
  const { data, ...dataSet } = useDataSets(durations, calendars);
  const dataRef = React.useRef(data);
  const [chart, setChart] = React.useState<
    Chart<'doughnut', RA<number>, string> | undefined
  >(undefined);
  const [loaded, handleLoaded] = useBooleanState();
  React.useEffect(() => {
    if (data.length > 0) handleLoaded();
    if (chart === undefined || dataRef.current === data) return;
    Array.from(
      {
        length: Math.max(chart.data.datasets[0].data.length, data.length),
      },
      (_, index) => {
        writable(chart.data.datasets[0].data)[index] = data[index];
      }
    );
    chart.update();
  }, [data, chart]);

  return loaded ? (
    <Doughnut
      data={{
        labels,
        datasets: [{ ...dataSet, data: dataRef.current }],
      }}
      options={{
        responsive: true,
      }}
      ref={(chart) => setChart(chart ?? undefined)}
    />
  ) : null;
}

function useLabels(
  calendars: React.ContextType<typeof CalendarsContext> | undefined
): WritableArray<string> {
  return React.useMemo(
    () =>
      calendars === undefined ? [] : calendars.map(({ summary }) => summary),
    [calendars]
  );
}

function useDataSets(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
): {
  readonly label: string;
  readonly data: RA<number>;
  readonly backgroundColor: RA<string>;
} {
  return React.useMemo(
    () => ({
      label: '',
      data:
        durations === undefined
          ? []
          : calendars?.map(({ id }) =>
              Object.values(durations[id] ?? {})
                .flatMap((durations) => Object.values(durations))
                .reduce((total, durations) => total + durations, 0)
            ) ?? [],
      backgroundColor:
        calendars?.map(({ backgroundColor }) => backgroundColor) ?? [],
    }),
    [durations, calendars]
  );
}
