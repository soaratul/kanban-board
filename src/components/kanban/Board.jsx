import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './Column';
import AddForm from './AddForm';
import { clearSelectedCardId, saveColumns, selectId } from '../../redux/kanbanSlice';
import { useDispatch, useSelector } from 'react-redux';
import EditForm from './EditForm';

const LOCAL_STORAGE_KEY = 'kanban-board-data';
export const initialColumns = {
  todo: {
    title: 'To Do',
    cards: [
      {
        "id": "task-1",
        "text": "Task 1"
      },
    ],
  },
  inProgress: {
    title: 'In Progress',
    cards: [
      {
        "id": "task-2",
        "text": "Task 2"
      },
      {
        "id": "task-3",
        "text": "Task 3"
      },
    ],
  },
  done: {
    title: 'Done',
    cards: [
      {
        "id": "task-4",
        "text": "Task 4"
      },
    ],
  },
};

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const selectedId = useSelector(selectId);
  const [columns, setColumns] = useState(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : initialColumns;
  });
  const handleSideBarClick = (event) => {
    event.stopPropagation();
  };

  const handleClick = (event) => {
    const classList = event.target.classList;
    if(!classList.contains('card-wrapper') && classList.length > 0) dispatch(clearSelectedCardId());
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    dispatch(saveColumns(columns));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addCardHandler = useCallback((newCard) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      todo: {
        ...prevColumns.todo,
        cards: [newCard, ...prevColumns.todo.cards],
      },
    }));
  });

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
  
    if (!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    // Find the source and destination columns
    const activeColumn = Object.keys(columns).find((key) =>
      columns[key].cards.some((card) => card.id === activeId)
    );
    const overColumn = Object.keys(columns).find((key) =>
      columns[key].cards.some((card) => card.id === overId)
    );
  
    if (!overColumn) {
      // If overId is not found in any column, it means the card is over an empty column
      const emptyColumn = over.id; // Use the column ID as the overId
      if (activeColumn !== emptyColumn) {
        // Move the card to the empty column during drag
        setColumns((prevColumns) => {
          const newSourceItems = prevColumns[activeColumn].cards.filter((card) => card.id !== activeId);
          const newDestinationItems = [{ id: activeId, text: active.data.current.card.text }]; // Add the card to the empty column
  
          return {
            ...prevColumns,
            [activeColumn]: {
              ...prevColumns[activeColumn],
              cards: newSourceItems,
            },
            [emptyColumn]: {
              ...prevColumns[emptyColumn],
              cards: newDestinationItems,
            },
          };
        });
      }
    } else if (activeColumn !== overColumn) {
      // Move the card to the destination column during drag
      setColumns((prevColumns) => {
        const newSourceItems = prevColumns[activeColumn].cards.filter((card) => card.id !== activeId);
        const newDestinationItems = [
          ...prevColumns[overColumn].cards,
          { id: activeId, text: active.data.current.card.text },
        ];
  
        return {
          ...prevColumns,
          [activeColumn]: {
            ...prevColumns[activeColumn],
            cards: newSourceItems,
          },
          [overColumn]: {
            ...prevColumns[overColumn],
            cards: newDestinationItems,
          },
        };
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Find the source and destination columns
    const activeColumn = Object.keys(columns).find((key) =>
      columns[key].cards.some((card) => card.id === activeId)
    );
    const overColumn = Object.keys(columns).find((key) =>
      columns[key].cards.some((card) => card.id === overId)
    );

    if (!overColumn) {
      // If overId is not found in any column, it means the card is over an empty column
      const emptyColumn = over.id; // Use the column ID as the overId
      if (activeColumn !== emptyColumn) {
        // Move the card to the empty column
        setColumns((prevColumns) => {
          const newSourceItems = prevColumns[activeColumn].cards.filter((card) => card.id !== activeId);
          const newDestinationItems = [{ id: activeId, text: active.data.current.card.text }]; // Add the card to the empty column

          return {
            ...prevColumns,
            [activeColumn]: {
              ...prevColumns[activeColumn],
              cards: newSourceItems,
            },
            [emptyColumn]: {
              ...prevColumns[emptyColumn],
              cards: newDestinationItems,
            },
          };
        });
      }
    } else if (activeColumn === overColumn) {
      setColumns((prevColumns) => ({
        ...prevColumns,
        [activeColumn]: {
          ...prevColumns[activeColumn],
          cards: arrayMove(
            prevColumns[activeColumn].cards,
            prevColumns[activeColumn].cards.findIndex((card) => card.id === activeId),
            prevColumns[overColumn].cards.findIndex((card) => card.id === overId)
          ),
        },
      }));
    }

    setActiveId(null);
  };

  const memoizedColumns = useMemo(() => {
    return Object.keys(columns).map((columnId) => ({
      id: columnId,
      title: columns[columnId].title,
      items: columns[columnId].cards,
    }));
  }, [columns]);

  const updateHandler = useCallback((columnName, name, value) => {
    const index = columns[columnName].cards.findIndex((card) => card.id === selectedId);
    const updatedColumns = structuredClone(columns);
    if(name === 'text') {
      updatedColumns[columnName].cards[index].text = value;
    } else if (name === 'column') {
      const sourceColumn = updatedColumns[columnName];
      const [movedCard] = sourceColumn.cards.splice(index, 1);
      updatedColumns[value].cards.unshift(movedCard);
    }
    setColumns(updatedColumns);
  });

  const onDeleteTask = useCallback((columnName) => {
    const updatedColumns = structuredClone(columns);
    const index = updatedColumns[columnName].cards.findIndex((card) => card.id === selectedId);
    updatedColumns[columnName].cards.splice(index, 1);
    setColumns(updatedColumns);
    dispatch(clearSelectedCardId());
  });
  
  return (
    <div>
      <AddForm onAddCard={addCardHandler} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className='container'>
          <div className={`columns-group ${selectedId ? 'with-edit-section' : ''}`}>
            {memoizedColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                items={column.items}
                activeId={activeId}
              />
            ))}
          </div>
          {selectedId && 
            <div onClick={handleSideBarClick} className='edit-section'>
              <EditForm selectedId={selectedId} updateHandler={updateHandler} onDelete={onDeleteTask} />
            </div>
          }
        </div>
      </DndContext>
    </div>
  );
}