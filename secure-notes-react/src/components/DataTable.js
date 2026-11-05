import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ rows, columns }) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 6,
          },
        },
      }}
      pageSizeOptions={[6]}
      disableRowSelectionOnClick
      disableColumnResize
    />
  );
};

export default DataTable;
