import React from 'react';

import { commonText } from '../../localization/common';
import type { GetSet, RA } from '../../utils/types';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button } from '../Atoms';
import { icon } from '../Atoms/Icon';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import type { SupportedView } from '../Contexts/CurrentViewContext';
import { CalendarList, VirtualCalendarsList } from '../Molecules/CalendarList';
import { DurationPicker } from '../Molecules/DurationPicker';
import type { Goal } from './Widget';
import { useVirtualCalendars } from '../PowerTools/AutoComplete';

export function GoalsEditor({
  goals: [goals, setGoals],
  currentView,
  calendars,
}: {
  readonly goals: GetSet<RA<Goal>>;
  readonly currentView: SupportedView;
  readonly calendars: RA<CalendarListEntry>;
}): JSX.Element {
  const virtualCalendars = useVirtualCalendars();
  return (
    <>
      {goals.map((goal, index) =>
        goal.view === currentView ? (
          <div className="flex gap-2" key={index}>
            <Button.Red
              aria-label={commonText('remove')}
              className="!p-1"
              title={commonText('remove')}
              onClick={(): void => setGoals(removeItem(goals, index))}
            >
              {icon.trash}
            </Button.Red>
            <CalendarList
              calendars={calendars}
              value={goal.calendarId}
              onChange={(calendarId): void =>
                setGoals(
                  replaceItem(goals, index, {
                    ...goal,
                    calendarId,
                  })
                )
              }
            />
            <VirtualCalendarsList
              calendar={goal.calendarId}
              virtualCalendars={virtualCalendars}
              value={goal.virtualCalendar}
              onChange={(virtualCalendar): void =>
                setGoals(
                  replaceItem(goals, index, {
                    ...goal,
                    virtualCalendar,
                  })
                )
              }
            />
            <DurationPicker
              value={goal.duration}
              onChange={(duration): void =>
                setGoals(
                  replaceItem(goals, index, {
                    ...goal,
                    duration,
                  })
                )
              }
            />
          </div>
        ) : undefined
      )}
      <div>
        <Button.White
          onClick={(): void =>
            setGoals([
              ...goals,
              {
                calendarId: calendars[0].id,
                duration: 0,
                view: currentView,
              },
            ])
          }
        >
          {commonText('addGoal')}
        </Button.White>
      </div>
    </>
  );
}
