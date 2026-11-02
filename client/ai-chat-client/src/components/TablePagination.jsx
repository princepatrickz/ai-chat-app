import React, { useState } from "react";
import Pagination from "react-bootstrap/Pagination";

const calculateRange = (rowsPerPage, totalCount) => {
  const range = [];
  const num = Math.ceil(totalCount / rowsPerPage);

  for (let i = 1; i <= num; i++) {
    range.push(i);
  }
  return range;
};

const TablePagination = ({
  page,
  setPage,
  rowsPerPage,
  totalCount,
  fetch,
  searchParam,
}) => {
  const numberOfPages = calculateRange(rowsPerPage, totalCount);

  const handlePageChange = (page, numberOfPages) => {
    if (page < 1 || page > numberOfPages) return;
    setPage(page);

    fetch({ page: page, size: rowsPerPage, searchParam: searchParam });
  };

  const renderPages = (currentPage, totalCount) => {
    const pages = [];
    const range = 2; // pages before & after current
    const numOfPages = Math.ceil(totalCount / rowsPerPage);

    // First page
    pages.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => handlePageChange(1, numOfPages)}
      >
        1
      </Pagination.Item>,
    );

    // Ellipsis before
    if (currentPage > range + 2) {
      pages.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    // Middle pages
    for (
      let i = Math.max(2, currentPage - range);
      i <= Math.min(numOfPages - 1, currentPage + range);
      i++
    ) {
      pages.push(
        <Pagination.Item
          key={i}
          active={currentPage === i}
          onClick={() => handlePageChange(i, numOfPages)}
        >
          {i}
        </Pagination.Item>,
      );
    }

    // Ellipsis after
    if (currentPage < numOfPages - range - 1) {
      pages.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    //Last page
    if (numOfPages > 1) {
      pages.push(
        <Pagination.Item
          key={numOfPages}
          active={currentPage === numOfPages}
          onClick={() => handlePageChange(numOfPages)}
        >
          {numOfPages}
        </Pagination.Item>,
      );
    }

    return pages;
  };

  return (
    <>
      <Pagination style={{ marginLeft: "auto" }}>
        <Pagination.Prev
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        />

        {renderPages(page, totalCount)}

        <Pagination.Next
          onClick={() => handlePageChange(page + 1)}
          disabled={page === numberOfPages.length}
        />
      </Pagination>
    </>
  );
};

export default TablePagination;
