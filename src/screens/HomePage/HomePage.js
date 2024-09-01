import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/HomePage/HomePage.css";
import { generateReport } from '../../actions/homeAction';
import { getTableColumnsByUserId, fetchSystemsByUserId } from '../../actions/systemAction';
import ReportPage from '../Report/ReportPage';
import { login } from '../../actions/loginAction'; // Import the login action

const HomePage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [interval, setInterval] = useState('');
    const [foundDataForReport, setFoundDataForReport] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [system, setSystem] = useState('');
    const [systems, setSystems] = useState([]);
    const [columns, setColumns] = useState([]); // State to hold all column names
    const [selectedColumns, setSelectedColumns] = useState([]); // State to hold selected column names
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.userId;
    const userName = user?.email; // Assuming 'email' is available in the user object
    const navigate = useNavigate(); // Initialize the useNavigate hook
    useEffect(() => {
        // Check if the user is logged in or not
        if (user && userName) {
            // Attempt to log in using credentials from local storage
            const storedEmail = userName;
            const storedPassword = user.password;

            if (storedEmail && storedPassword) {
                login(storedEmail, storedPassword)
                    .then(response => {
                        console.log("xxxx: ", response)
                        if (response.status === 200) {
                            localStorage.setItem('user', JSON.stringify(response.data)); // Save user data to localStorage
                        } else {
                            navigate('/login'); // Redirect to login page
                        }
                    })
                    .catch(error => {
                        console.error('Failed to auto-login:', error);
                        navigate('/login'); // Redirect to login page
                    });
            } else {
                navigate('/login'); // Redirect to login page
            }
        }
    }, []);

    useEffect(() => {
        if (user && userId) {
            // Fetch systems for the user
            fetchSystemsByUserId(userId)
                .then(response => {
                    setSystems(response.data.data); // Update systems state with fetched data
                })
                .catch(error => {
                    console.error('Failed to fetch systems:', error);
                    navigate('/');
                });

            // Fetch column names from the maindata table
            getTableColumnsByUserId()
                .then(response => {
                    setColumns(response.data.columnNames); // Update columns state with fetched column names
                    setSelectedColumns(response.data.columnNames); // Initially, select all columns
                })
                .catch(error => {
                    console.error('Failed to fetch column names:', error);
                });
        } else {
            navigate('/');
        }
    }, []);

    // Other component functions and JSX remain unchanged



    const handleChange = (event) => {
        setInterval(event.target.value);
    };

    const handleSelectSystemChange = (event) => setSystem(event.target.value);

    const handleColumnChange = (column) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter(col => col !== column)); // Unselect column
        } else {
            setSelectedColumns([...selectedColumns, column]); // Select column
        }
    };

    const generateReportFunction = () => {
        generateReport(startDate, endDate, interval, system, userId)
            .then(response => {
                console.log(response);
                setFoundDataForReport(response?.data ?? []);
                setShowReport(true);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('user'); // Clear user from local storage
        navigate('/'); // Redirect to login page
    };

    const formatDateForSQL = (isoDate) => {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    const handleClose = () => {
        setShowReport(false);
    };

    return (
        <>
            <div className="home-page-container">
                <header className="header">
                    <div className="user-info">
                        <span>Welcome, <span style={{ color: "blue" }}>{userName}</span></span>
                    </div>
                    <div>
                        <button
                            className="scada-login-button"
                            onClick={() => window.open('https://192.168.1.55/', '_blank')}
                        >
                            Click Login Scada
                        </button>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </header>

                <h1 className="page-title">Generate Report</h1>
                <div className="form-group">
                    <label htmlFor="start-date" className="form-label">Start Date:</label>
                    <input
                        type='datetime-local'
                        id="start-date"
                        className="form-input"
                        onChange={(e) => setStartDate(formatDateForSQL(e.target.value))}
                        value={startDate}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="end-date" className="form-label">End Date:</label>
                    <input
                        type='datetime-local'
                        id="end-date"
                        className="form-input"
                        onChange={(e) => setEndDate(formatDateForSQL(e.target.value))}
                        value={endDate}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="system" className="form-label">Select System:</label>
                    <select
                        id="system"
                        className="form-select"
                        value={system}
                        onChange={handleSelectSystemChange}
                    >
                        <option value="">-- Select System --</option>
                        {systems.map((sys) => (
                            <option key={sys.id} value={sys.systemId}>
                                {sys.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="interval" className="form-label">Interval:</label>
                    <select
                        id="interval"
                        className="form-select"
                        value={interval}
                        onChange={handleChange}
                    >
                        <option value="">-- Select an interval --</option>
                        <option value="1">Per 1 Minute</option>
                        <option value="5">Per 5 Minutes</option>
                        <option value="10">Per 10 Minutes</option>
                        <option value="15">Per 15 Minutes</option>
                        <option value="30">Per 30 Minutes</option>
                        <option value="60">Per 1 Hour</option>
                    </select>
                </div>

                {/* Render checkboxes for selecting columns */}
                <div className="form-group">
                    <label className="form-label">Choose Report Parameters:</label>
                    <div className="checkbox-container">
                        {columns.map((column) => (
                            <div key={column} className="form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={column}
                                    checked={selectedColumns.includes(column)}
                                    onChange={() => handleColumnChange(column)}
                                />
                                <label htmlFor={column} className="form-check-label">{column}</label>
                            </div>
                        ))}
                    </div>
                </div>


                {(startDate && endDate && interval && system) && (
                    <button
                        className="generate-button"
                        onClick={generateReportFunction}
                    >
                        Generate Report
                    </button>
                )}
            </div>
            {
                (showReport && foundDataForReport?.length > 0) &&
                <ReportPage
                    searchCriteria={{ startDate, endDate, interval, system, selectedColumns }}
                    rows={foundDataForReport}
                    show={true}
                    handleClose={handleClose}
                />
            }
        </>
    );
}

export default HomePage;
