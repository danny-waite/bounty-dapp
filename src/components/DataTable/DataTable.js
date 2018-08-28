import React from 'react';
import PropTypes from 'prop-types';
import Griddle, { plugins } from 'griddle-react';

import { connect } from 'react-redux';

const NewLayout = ({ Table, Pagination, Filter, SettingsWrapper }) => (
    <div>
      {/* <Filter /> */}
      {/* <Pagination /> */}
      <Table />
    </div>
  );

const DataTable = props => {

    const styleConfig = {
        
        classNames: {
          Table: 'ui celled striped table',
        },
        styles: {

        }
      }

    return (
        <Griddle
            data={props.data}
            styleConfig={styleConfig}
            enableSettings={false}
            plugins={[plugins.LocalPlugin]}
            components={{
                Layout: NewLayout
              }}
            >
            {props.children}
        </Griddle>
    );
};

DataTable.propTypes = {
    data: PropTypes.array.isRequired
};

export default DataTable;

const rowDataSelector = (state, { griddleKey }) => {
    return state
      .get('data')
      .find(rowMap => rowMap.get('griddleKey') === griddleKey)
      .toJSON();
};
  
export const enhancedWithRowData = connect((state, props) => {
    return {
      // rowData will be available into MyCustomComponent
      rowData: rowDataSelector(state, props)
    };
});