import React from 'react';
import { DataTable, RowDefinition, ColumnDefinition, enhancedWithRowData } from "../DataTable";
import { Link } from "react-router-dom";
import moment from "moment";

const ActiveBountyList = props => {

    const customTitleColumn = ({ value, rowData }) => <Link to={`/bounty/${rowData.id}`}>{value}</Link>;
    const customDeadlineColumn = ({ value }) => <span>{moment(value).format("MM/DD/YYYY")}</span>;

    return (
        <DataTable data={props.data}>
             <RowDefinition>
                <ColumnDefinition id="id" title="ID" />
                <ColumnDefinition id="title" title="Title" customComponent={enhancedWithRowData(customTitleColumn)} />
                <ColumnDefinition id="description" title="Description" />
                <ColumnDefinition id="prize" title="Prize" />
                <ColumnDefinition id="deadline" title="Deadline" customComponent={customDeadlineColumn} />
            </RowDefinition>
        </DataTable>
    );
};

ActiveBountyList.propTypes = {
    
};

export default ActiveBountyList;