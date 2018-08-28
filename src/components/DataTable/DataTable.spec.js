import React from "react";
import { shallow, mount } from 'enzyme';
import { DataTable } from ".";

describe("<DataTable/>", () => {

    beforeEach(()=> {

        
    });

    it("test grid with data", () => {
        
        let data = [
            { name: 'one', two: 'two', three: 'three' },
            { name: 'uno', two: 'dos', three: 'tres' },
            { name: 'ichi', two: 'ni', three: 'san' }
          ];

        const mountedTable = mount(<DataTable data={data}/>);

        const table = mountedTable.find('table');
        expect(table.length).toBe(1);

        const tableBody = mountedTable.find('tbody');
        expect(tableBody.children()).toHaveLength(3);

    });

    it("test grid with no data", () => {
        const mountedTable = mount(<DataTable data={[]}/>);

        const table = mountedTable.find('table');
        expect(table.length).toBe(0);

        const noResults = mountedTable.find('div.griddle-noResults');
        expect(noResults.text()).toEqual('No results found.');
    });
})