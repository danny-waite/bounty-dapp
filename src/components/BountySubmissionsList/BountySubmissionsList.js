import React from 'react';
import { DataTable, RowDefinition, ColumnDefinition, enhancedWithRowData } from "../DataTable";
import { Button } from "semantic-ui-react";

const awardColumn = ({ bountyId, value, awardHandler }) => <Button onClick={() => awardHandler(bountyId, value)}>Award</Button>

const BountySubmissionsList = ({ bountyId, data, showAward, awardHandler }) => {
    return (
        <DataTable data={data}>
             <RowDefinition>
                <ColumnDefinition id="address" title="Address" />
                <ColumnDefinition id="submissionHash" title="Hash" />
                {showAward && <ColumnDefinition id="id" title=" " customComponent={ awardColumn } extraData={{ bountyId, showAward, awardHandler }} />}
            </RowDefinition>
        </DataTable>
    );
};

export default BountySubmissionsList;