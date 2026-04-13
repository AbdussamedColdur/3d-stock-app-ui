import React from "react";
import ChartistGraph from "react-chartist";
import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
} from "react-bootstrap";

import StatCard from "components/Cards/StatCard";
import TaskItem from "components/Tasks/TaskItem";

const TASKS = [
  {
    id: 1,
    text: 'Sign contract for "What are conference organizers afraid of?"',
    checked: false,
  },
  {
    id: 2,
    text: "Lines From Great Russian Literature? Or E-mails From My Boss?",
    checked: true,
  },
  {
    id: 3,
    text: "Flooded: One year later, assessing what was lost and what was found when a ravaging rain swept through metro Detroit",
    checked: true,
  },
  {
    id: 4,
    text: "Create 4 Invisible User Experiences you Never Knew About",
    checked: true,
  },
  {
    id: 5,
    text: 'Read "Following makes Medium better"',
    checked: false,
  },
  {
    id: 6,
    text: "Unfollow 5 enemies from twitter",
    checked: false,
    disabled: true,
  },
];

function Dashboard() {
  return (
    <>
      <Container fluid>
        {/* Stats Row */}
        <Row>
          <Col lg="3" sm="6">
            <StatCard
              icon="nc-icon nc-chart"
              iconColor="warning"
              title="Number"
              value="150GB"
              footerIcon="fas fa-redo"
              footerText="Update Now"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              icon="nc-icon nc-light-3"
              iconColor="success"
              title="Revenue"
              value="$ 1,345"
              footerIcon="far fa-calendar-alt"
              footerText="Last day"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              icon="nc-icon nc-vector"
              iconColor="danger"
              title="Errors"
              value="23"
              footerIcon="far fa-clock-o"
              footerText="In the last hour"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              icon="nc-icon nc-favourite-28"
              iconColor="primary"
              title="Followers"
              value="+45K"
              footerIcon="fas fa-redo"
              footerText="Update now"
            />
          </Col>
        </Row>

        {/* Charts Row */}
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Users Behavior</Card.Title>
                <p className="card-category">24 Hours performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: [
                        "9:00AM",
                        "12:00AM",
                        "3:00PM",
                        "6:00PM",
                        "9:00PM",
                        "12:00PM",
                        "3:00AM",
                        "6:00AM",
                      ],
                      series: [
                        [287, 385, 490, 492, 554, 586, 698, 695],
                        [67, 152, 143, 240, 287, 335, 435, 437],
                        [23, 113, 67, 108, 190, 239, 307, 308],
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: 800,
                      showArea: false,
                      height: "245px",
                      axisX: {
                        showGrid: false,
                      },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: {
                        right: 50,
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Open <i className="fas fa-circle text-danger"></i>
                  Click <i className="fas fa-circle text-warning"></i>
                  Click Second Time
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Email Statistics</Card.Title>
                <p className="card-category">Last Campaign Performance</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      labels: ["40%", "20%", "40%"],
                      series: [40, 20, 40],
                    }}
                    type="Pie"
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Open <i className="fas fa-circle text-danger"></i>
                  Bounce <i className="fas fa-circle text-warning"></i>
                  Unsubscribe
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock"></i>
                  Campaign sent 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">2017 Sales</Card.Title>
                <p className="card-category">All products including Taxes</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      series: [
                        [
                          542, 443, 320, 780, 553, 453, 326, 434, 568, 610,
                          756, 895,
                        ],
                        [
                          412, 243, 280, 580, 453, 353, 300, 364, 368, 410,
                          636, 695,
                        ],
                      ],
                    }}
                    type="Bar"
                    options={{
                      seriesBarDistance: 10,
                      axisX: {
                        showGrid: false,
                      },
                      height: "245px",
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          seriesBarDistance: 5,
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Tesla Model S <i className="fas fa-circle text-danger"></i>
                  BMW 5 Series
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-check"></i>
                  Data information certified
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Tasks</Card.Title>
                <p className="card-category">Backend development</p>
              </Card.Header>
              <Card.Body>
                <div className="table-full-width">
                  <Table>
                    <tbody>
                      {TASKS.map((task) => (
                        <TaskItem
                          key={task.id}
                          id={task.id}
                          text={task.text}
                          checked={task.checked}
                          disabled={task.disabled}
                        />
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
