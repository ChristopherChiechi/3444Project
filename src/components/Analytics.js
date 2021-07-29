import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Card, CardContent, Grid } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Sidebar from "./Sidebar";
import { Chart } from "react-google-charts";
import moment from "moment";
import { db } from "../firebase";

export default function Analytics() {
  const [errorPieChart, setErrorPieChart] = useState("");
  const [errorBarChart, setErrorBarChart] = useState("");
  const history = useHistory();
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    vehicle: 0,
    Groceries: 0,
    Home: 0,
    Utility: 0,
    Fuel: 0,
    Entertainment: 0,
    Medical: 0,
    Mortgage: 0,
    Phone: 0,
    Edu: 0,
    Misc: 0,
  });

  let month = "";
  var vehicleAmount = 0;
  var groceriesAmount = 0;
  var homeAmount = 0;
  var utilityAmount = 0;
  var fuelAmount = 0;
  var phoneAmount = 0;
  var entertainmentAmount = 0;
  var medicalAmount = 0;
  var mortgageAmount = 0;
  var eduAmount = 0;
  var miscAmount = 0;
  month = moment().format("MMMM"); //should work

  async function fetchMonthlyExpenses() {
    const sleep = (waitTimeInMs) =>
      new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
    setErrorPieChart(""); //No error yet
    const docRef = db.collection("UserTransaction");
    const snapshot = await docRef
      .where("UserID", "==", currentUser.uid)
      .where("Month", "==", month)
      .get(); //Only get transaction for the current user UID in current month
    snapshot.forEach((doc) => {
      var dataResult = doc.data();
      var stringAmount = dataResult.Amount; //Get the amount of the current transaction
      var numberAmount = Number(stringAmount.replace(/[^0-9.-]+/g, "")); //Remove the currency symbol and convert to integer/number
      switch (
        dataResult.Type //Switch statement to add up expenses for each category
      ) {
        case "Vehicle":
          vehicleAmount += numberAmount;
          break;
        case "Groceries":
          groceriesAmount += numberAmount;
          break;
        case "Home improvement":
          homeAmount += numberAmount;
          break;
        case "Utility":
          utilityAmount += numberAmount;
          break;
        case "Fuel":
          fuelAmount += numberAmount;
          break;
        case "Entertainment":
          entertainmentAmount += numberAmount;
          break;
        case "Medical":
          medicalAmount += numberAmount;
          break;
        case "Mortgage/Rent":
          mortgageAmount += numberAmount;
          break;
        case "Phone Payment":
          phoneAmount += numberAmount;
          break;
        case "Edu":
          eduAmount += numberAmount;
          break;
        case "Misc":
          miscAmount += numberAmount;
          break;
      }
      const dataObject = {
        //Create object to hold everything
        Vehicle: vehicleAmount,
        Groceries: groceriesAmount,
        Home: homeAmount,
        Utility: utilityAmount,
        Fuel: fuelAmount,
        Entertainment: entertainmentAmount,
        Medical: medicalAmount,
        Mortgage: mortgageAmount,
        Phone: phoneAmount,
        Edu: eduAmount,
        Misc: miscAmount,
      };
      setData(dataObject); //Set the object so that we can use later
      const isEmpty = Object.values(dataObject).every((x) => x === 0); //Check if we have at least 1 type of category to show
      if (isEmpty == true) {
        //If not then prompt error
        setErrorPieChart(
          "There is no data to show for the current month. Please use the transaction page to enter at least 1 transaction for the current month"
        );
      }
    });
  }

  useEffect(() => {
    //Run our fetch function on page render.
    async function Fetch() {
      fetchMonthlyExpenses();
    }
    Fetch();
  }, []);

  return (
    <div>
      <Sidebar />
      <Grid container spacing={3} wrap="nowrap">
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <h2 className="text-center mb-4">Current Expenses for {month}</h2>
              {errorPieChart && (
                <Alert variant="outlined" severity="warning" className="mb-3">
                  {errorPieChart}
                </Alert>
              )}
              <Chart
                width={"500px"}
                height={"300px"}
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={[
                  ["Expense", "Amount"],
                  ["Vehicle", data.Vehicle],
                  ["Groceries", data.Groceries],
                  ["Home Improvement", data.Home],
                  ["Utility", data.Utility],
                  ["Petrol/Gas", data.Fuel],
                  ["Entertainment", data.Entertainment],
                  ["Medical", data.Medical],
                  ["Mortgage/Rent", data.Mortgage],
                  ["Cellular/Phone Payment", data.Phone],
                  ["Education", data.Edu],
                  ["Misc", data.Misc],
                ]}
                options={{
                  chartArea: { width: "100%" },
                }}
                rootProps={{ "data-testid": "1" }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <h2 className="text-center mb-4">Debt Payoff Chart</h2>
              {errorBarChart && (
                <Alert variant="outlined" severity="warning" className="mb-3">
                  {errorBarChart}
                </Alert>
              )}
              <Chart
                width={"500px"}
                height={"300px"}
                chartType="ColumnChart"
                loader={<div>Loading Chart</div>}
                data={[
                  ["Month", "Debt", "Monthly Payment"],
                  ["Jan", 12000, 1000],
                  ["Feb", 11000, 1000],
                  ["Mar", 10000, 1000],
                  ["Apr", 9000, 1000],
                  ["May", 8000, 1000],
                  ["Jun", 7000, 1000],
                  ["Jul", 6000, 1000],
                  ["Aug", 5000, 1000],
                  ["Sept", 4000, 1000],
                  ["Oct", 3000, 1000],
                  ["Nov", 2000, 1000],
                  ["Dec", 1000, 1000],
                ]}
                options={{
                  chartArea: { width: "49%" },
                  isStacked: true,
                  hAxis: {
                    title: "Month",
                    minValue: 0,
                  },
                  vAxis: {
                    title: "Amount",
                  },
                }}
                rootProps={{ "data-testid": "2" }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
