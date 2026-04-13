import React from "react";
import {
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

function TaskItem({ text, checked, disabled, onEdit, onDelete, id }) {
  return (
    <tr>
      <td>
        <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
            <Form.Check.Input
              defaultChecked={checked}
              defaultValue=""
              disabled={disabled}
              type="checkbox"
            ></Form.Check.Input>
            <span className="form-check-sign"></span>
          </Form.Check.Label>
        </Form.Check>
      </td>
      <td>{text}</td>
      <td className="td-actions text-right">
        <OverlayTrigger
          overlay={<Tooltip id={`tooltip-edit-${id}`}>Edit Task..</Tooltip>}
        >
          <Button
            className="btn-simple btn-link p-1"
            type="button"
            variant="info"
            onClick={onEdit}
          >
            <i className="fas fa-edit"></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          overlay={<Tooltip id={`tooltip-delete-${id}`}>Remove..</Tooltip>}
        >
          <Button
            className="btn-simple btn-link p-1"
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            <i className="fas fa-times"></i>
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  );
}

export default TaskItem;
