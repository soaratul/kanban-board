import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './Card';
import { useDroppable } from '@dnd-kit/core';
import { memo } from 'react';

export const KanbanColumn = memo(({ id, title, items, activeId }) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className='column'
    >
      <h3>{title}</h3>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((card) => (
          <KanbanCard key={card.id} id={card.id} text={card.text} activeId={activeId} />
        ))}
      </SortableContext>
    </div>
  );
});