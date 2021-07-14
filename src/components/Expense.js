import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import DateFnsUtils from "@date-io/date-fns";
import Alert from "@material-ui/lab/Alert";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import PropTypes from "prop-types";
import {
  Table,
  Button,
  Select,
  MenuItem,
  FormControl,
  Card,
  TablePagination,
  TextField,
  Grid,
  TableCell,
  TableRow,
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  Typography,
  makeStyles,
  Box,
  Collapse,
  IconButton,
  FormHelperText,
  CardContent,
  Tooltip,
} from "@material-ui/core";
import moment from "moment";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { StayCurrentLandscape } from "@material-ui/icons";
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columns = [
  {
    id: "ID",
    label: "ID",
    maxWidth: 5,
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "Type",
    label: "Type",
    minWidth: 100,
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "Date",
    label: "Date",
    minWidth: 120,
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "Amount",
    label: "Amount",
    minWidth: 100,
  },
  {
    id: "Note",
    label: "Note",
    minWidth: 100,
    format: (value) => value.toLocaleString("en-US"),
  },
];

export default function Expense() {
  const amountInputRef = useRef();
  const noteInputRef = useRef();
  const [selectedDate, setSelectedDate] = React.useState(new Date()); //Set and get the date from the date picker
  const [error, setError] = useState(""); //For alerting errors to users
  const { currentUser, logout } = useAuth(); //Get the UUID of current login users
  const [transType, setTransType] = useState(""); //For Transaction Type
  const [loading, setLoading] = useState(false); //Set loading state
  //Table
  const [page, setPage] = useState(0); //Table Page handle
  const [rowsPerPage, setRowsPerPage] = useState(5); //Table page properties
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  //Handle change row per page in table
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //Handle the changing value for types
  const handleChangeType = (event) => {
    setTransType(event.target.value);
  };

  //Date picker componenet
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  //Generate ID for transaction
  async function generateNewID() {
    var highestID = 0;
    const docRef = db.collection("UserTransaction");
    const snapshot = await docRef.where("UserID", "==", currentUser.uid).get();
    if (snapshot.empty) {
      return highestID;
    }
    snapshot.forEach((doc) => {
      const dataResult = doc.data();
      if (dataResult.ID > highestID) {
        highestID = dataResult.ID;
      }
      if (!dataResult.ID) {
        highestID = Number(0);
      }
    });
    return highestID;
  }

  async function addExpenseButton() {
    if (amountInputRef.current.value == "") {
      setError("Sorry, please enter the amount for this transaction");
      return;
    }
    if (!transType) {
      setError("Sorry, please pick the type for this transaction");
      return;
    }
    var newID = Number(await generateNewID()) + Number(1);
    var date = moment(selectedDate).format("YYYY-MM-DD");
    const transactionData = {
      Amount: formatter.format(amountInputRef.current.value),
      Type: transType,
      UserID: currentUser.uid,
      Note: noteInputRef.current.value,
      Date: date,
      ID: newID,
    };
    setError("");
    const res = await db
      .collection("UserTransaction")
      .doc()
      .set(transactionData);
    setTransType("");
    amountInputRef.current.value = "";
    noteInputRef.current.value = "";
    setSelectedDate(new Date());
    window.location.reload();
  }

  //#GetData

  async function getTransactionData() {
    try {
      const snapshot = await db.collection("UserTransaction").get();
      return snapshot.docs.map((doc) => doc.data());
    } catch (e) {}
  }

  var [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    async function fetchTransaction() {
      const preSort = await getTransactionData();
      const sorted = preSort.sort((a, b) => a.ID - b.ID);
      setData(sorted);
      setLoading(false);
    }
    fetchTransaction();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  //#endregion

  const useRowStyles = makeStyles({
    root: {
      "& > *": {
        borderBottom: "unset",
      },
    },
  });

  //Table
  return (
    <div
      className="d-flex align-items-center "
      style={{ minHeight: "125vh", minWidth: 800 }}
    >
      <Sidebar />
      <Grid container spacing={3}>
        <Grid item sx={24} sm={12}>
          <Card>
            <CardContent>
              <h2 className="text-center mb-4"> Expenses And Transaction</h2>
              {error && (
                <Alert variant="outlined" severity="error">
                  {error}
                </Alert>
              )}
              <FormControl variant="outlined" style={{ display: "flex" }}>
                <Tooltip title="Enter Expense Amount: ">
                  <TextField
                    required
                    id="standard-required"
                    label="Amount"
                    inputRef={amountInputRef}
                    defaultValue=""
                    type="number"
                    className="w-100 text-center mt-2 mb-3"
                  />
                </Tooltip>
                <div>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      margin="normal"
                      id="date-picker-dialog"
                      label="Transaction Date:"
                      format="MM/dd/yyyy"
                      className="w-100 text-center mt-2 mb-3"
                      value={selectedDate}
                      onChange={handleDateChange}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>

                <Select
                  required
                  labelId="demo-simple-select-filled-label"
                  id="demo-simple-select-filled"
                  label="test"
                  defaultValue="Set the transaction type:"
                  value={transType}
                  onChange={handleChangeType}
                  autoWidth={true}
                  className="w-100 text-justify mt-1"
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value="" disabled>
                    Transaction Type:
                  </MenuItem>
                  <MenuItem value={"Vehicle"}>
                    Vehicle (Payment/Insurance/Maintenance)
                  </MenuItem>
                  <MenuItem value={"Groceries"}>Groceries</MenuItem>
                  <MenuItem value={"Home_improvement"}>
                    Home Improvement
                  </MenuItem>
                  <MenuItem value={"Utility"}>Utility</MenuItem>
                  <MenuItem value={"Petrol_Gas"}>Petrol/Gas</MenuItem>
                  <MenuItem value={"Entertainment"}>Entertainment</MenuItem>
                  <MenuItem value={"Medical"}>Medical</MenuItem>
                  <MenuItem value={"Mortgage_Rent"}>Mortgage/Rent</MenuItem>
                  <MenuItem value={"Cellular_Phone_Payment"}>
                    Cellular/Phone Payment
                  </MenuItem>
                  <MenuItem value={"Education"}>Education</MenuItem>
                  <MenuItem value={"Misc"}>Misc</MenuItem>
                </Select>
                <FormHelperText className="w-100 text-justify mt-2">
                  Set the transaction type
                </FormHelperText>

                <TextField
                  placeholder="Please enter any note for the transaction."
                  multiline
                  rows={2}
                  variant="outlined"
                  inputRef={noteInputRef}
                  className="w-100 text-center mt-2 mb-2"
                  rowsMax={4}
                />

                <Button
                  color="primary"
                  size="large"
                  variant="contained"
                  type="submit"
                  onClick={addExpenseButton}
                  className="w-100 text-center mt-2 mb-2"
                >
                  Add Expense
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sx={24} sm={12}>
          <Card>
            <CardContent>
              <h2 className="text-center">Recent transaction</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.ID}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => {
                        return (
                          <TableRow hover tabIndex={-1} key={row.ID}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format && typeof value === "number"
                                    ? column.format(value)
                                    : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
