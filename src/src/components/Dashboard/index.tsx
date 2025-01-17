import React from 'react';
import type { State } from 'typesafe-reducer';

import { useBooleanState } from '../../hooks/useBooleanState';
import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { RA } from '../../utils/types';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button, Widget } from '../Atoms';
import type { EventsStore } from '../EventsStore';
import { PageHeader } from '../Molecules/PageHeader';
import { defaultLayout, widgetGridColumnSizes } from './definitions';
import type { BreakPoint } from './useBreakpoint';
import { useBreakpoint } from './useBreakpoint';
import { AddWidgetButton, WidgetContent } from './Widget';
import { WidgetEditorOverlay } from './WidgetEditorOverlay';
import { ResetToDefaultButton } from '../Preferences';

/**
 * The widget container. Also handles editing the layout
 */
export function Dashboard({
  durations,
  onOpenPreferences: handleOpenPreferences,
}: {
  readonly durations: EventsStore | undefined;
  readonly onOpenPreferences: () => void;
}): JSX.Element {
  const [isEditing, _, __, handleToggle] = useBooleanState();

  const [layout = [], setLayout] = useStorage('layout');
  const originalLayout = React.useRef<RA<WidgetDefinition>>([]);
  React.useEffect(() => {
    if (isEditing) originalLayout.current = layout;
  }, [isEditing]);

  const breakpoint = useBreakpoint();
  const className = `${widgetClassName} ${isEditing ? '' : 'overflow-y-auto'}`;

  return (
    <>
      <PageHeader label={commonText('calendarPlus')}>
        {isEditing ? (
          <>
            <Button.Default
              onClick={(): void => {
                setLayout(originalLayout.current);
                handleToggle();
              }}
            >
              {commonText('cancel')}
            </Button.Default>
            <ResetToDefaultButton
              onClick={(): void => setLayout(defaultLayout)}
            />
          </>
        ) : (
          <Button.Default onClick={handleOpenPreferences}>
            {commonText('preferences')}
          </Button.Default>
        )}
        <Button.Default onClick={handleToggle}>
          {isEditing ? commonText('save') : commonText('edit')}
        </Button.Default>
      </PageHeader>
      <div className="overflow-y-auto overflow-x-hidden">
        <div
          className={`
            grid grid-cols-[repeat(var(--grid-cols),1fr)]
            ${isEditing ? 'gap-4 p-2' : 'gap-2'}
          `}
          style={
            {
              '--grid-cols': widgetGridColumnSizes[breakpoint],
            } as React.CSSProperties
          }
        >
          {layout.map((widget, index) => (
            <Widget
              className={className}
              key={index}
              style={
                {
                  '--col-span': widget.colSpan[breakpoint],
                  '--row-span': widget.rowSpan[breakpoint],
                } as React.CSSProperties
              }
            >
              {isEditing ? (
                <WidgetEditorOverlay
                  breakpoint={breakpoint}
                  key={index}
                  widget={widget}
                  onEdit={(newWidget): void =>
                    setLayout(
                      newWidget === undefined
                        ? removeItem(layout, index)
                        : replaceItem(layout, index, newWidget),
                    )
                  }
                />
              ) : (
                <WidgetContent
                  definition={widget.definition}
                  durations={durations}
                />
              )}
            </Widget>
          ))}
          {isEditing && (
            <section
              className={className}
              style={
                {
                  '--col-span': 1,
                  '--row-span': 1,
                } as React.CSSProperties
              }
            >
              <AddWidgetButton
                onClick={(): void =>
                  setLayout([
                    ...layout,
                    {
                      colSpan: singleRow,
                      rowSpan: singleRow,
                      definition: {
                        type: 'DoughnutChart',
                      },
                    },
                  ])
                }
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export type WidgetGridColumnSizes = Readonly<Record<BreakPoint, number>>;

export type WidgetDefinition = {
  readonly colSpan: WidgetGridColumnSizes;
  readonly rowSpan: WidgetGridColumnSizes;
  readonly definition:
    | State<'DoughnutChart'>
    | State<'GhostedEvents'>
    | State<'GoalsWidget'>
    | State<'StackedChart'>
    | State<'Synonyms'>
    | State<'TimeChart'>
    | State<'VirtualCalendars'>;
};

const widgetClassName = `
  relative
  col-[span_var(--col-span)_/_span_var(--col-span)] 
  row-[span_var(--row-span)_/_span_var(--row-span)]
`;

const singleRow = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1,
  '2xl': 1,
} as const;
