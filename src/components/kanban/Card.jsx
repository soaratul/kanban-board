import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDispatch } from 'react-redux';
import { changeSelectedCardId } from '../../redux/kanbanSlice';
import { memo } from 'react';

export const KanbanCard = memo(({ id, text, activeId }) => {
  const dispatch = useDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: 'card',
      card: { id, text },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: id === activeId ? 0.6 : 1,
  };

  const onCardClick = (e) => {
    dispatch(changeSelectedCardId(id));
  }

  return (
    <div className='card-wrapper' style={style} ref={setNodeRef}  {...attributes} onClick={() => onCardClick(id)}>
      <div className='card' {...listeners}>
      &#9783;
      </div>
      {text}
    </div>
  );
});