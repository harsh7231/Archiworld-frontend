import { Button } from "./buttons";

export const template1 = {
  layout: "PrevPageLink PageLinks NextPageLink",
  PrevPageLink: (options) => {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={options.onClick}
        disabled={options.disabled}
      >
        Previous
      </Button>
    );
  },
  NextPageLink: (options) => {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={options.onClick}
        disabled={options.disabled}
      >
        Next
      </Button>
    );
  },
  PageLinks: (options) => {
    if (
      (options.view.startPage === options.page &&
        options.view.startPage !== 0) ||
      (options.view.endPage === options.page &&
        options.page + 1 !== options.totalPages)
    ) {
      return <span style={{ userSelect: "none" }}>...</span>;
    }
    const isActive = options.page === options.currentPage;
    return (
      <Button
        type="button"
        variant={`${isActive ? "circle_active" : "circle"}`}
        className={`${options.className} mx-1`}
        onClick={options.onClick}
      >
        {options.page + 1}
      </Button>
    );
  },
};
