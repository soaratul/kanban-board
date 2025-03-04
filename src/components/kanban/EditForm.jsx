import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelectedCardId, selectColumns } from "../../redux/kanbanSlice";
import { initialColumns } from "./Board";

const EditForm = memo(({selectedId, updateHandler, onDelete}) => {
  const dispatch = useDispatch();
    const columnNames = Object.keys(initialColumns).map(column => ({value: column, text: initialColumns[column].title}));
    const columns = useSelector(selectColumns);
    const columnName = Object.keys(columns).find((key) =>
      columns[key].cards.some((card) => card.id === selectedId)
    );
    const cardData = columns[columnName].cards.find((card) => card.id === selectedId);
    const editFormHandler = (e) => {
      updateHandler(columnName, e.target.name, e.target.value);
    }
    const closeSideBar = () => dispatch(clearSelectedCardId());
    return (
        <>
          <h3>Edit Task</h3>
          <span onClick={closeSideBar} className="close-sidebar"></span>
          <div className="edit-field-row">
            <label>Title</label>
              <input
                name="text"
                type="text"
                value={cardData.text}
                onChange={editFormHandler}
                placeholder="Task title"
                className="input-field edit"
              />
            </div>
            <div className="edit-field-row">
            <label>Status</label>
              <select value={columnName} name="column" onChange={editFormHandler}>
                {columnNames.map(item => {
                  return <option key={item.value} value={item.value}>{item.text}</option>
                })}
              </select>
            </div>
            <div className="edit-field-row center">
              <button className="btn-delete" onClick={() => onDelete(columnName)}>Delete Task</button>
            </div>
          </>
    );
});

export default EditForm;