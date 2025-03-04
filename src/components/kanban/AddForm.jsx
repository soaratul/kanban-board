import { memo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const AddForm = memo(({onAddCard}) => {
    const [newCardText, setNewCardText] = useState('');
    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (!newCardText.trim()) return;

        const newCard = {
        id: uuidv4(),
        text: newCardText,
        };
        onAddCard(newCard);
        setNewCardText('');
    }
    return (
        <form onSubmit={onSubmitHandler} className="add-form">
            <input
              type="text"
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              placeholder="Enter a new task"
              className="input-field add"
            />
            <button type="submit" style={{ padding: '8px 16px' }}>
              Add Card
            </button>
          </form>
    );
});

export default AddForm;