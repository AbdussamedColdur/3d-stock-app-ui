import React from "react";
import { Card, Row, Col } from "react-bootstrap";

function StatCard({ icon, iconColor, title, value, footerIcon, footerText }) {
  return (
    <Card className="card-stats">
      <Card.Body>
        <Row>
          <Col xs="5">
            <div className="icon-big text-center icon-warning">
              <i className={`${icon} text-${iconColor}`}></i>
            </div>
          </Col>
          <Col xs="7">
            <div className="numbers">
              <p className="card-category">{title}</p>
              <Card.Title as="h4">{value}</Card.Title>
            </div>
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer>
        <hr></hr>
        <div className="stats">
          <i className={`${footerIcon} mr-1`}></i>
          {footerText}
        </div>
      </Card.Footer>
    </Card>
  );
}

export default StatCard;
