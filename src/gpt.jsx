// ... (Previous code)

const Whiteboard = () => {
  // ... (Previous code)

  const handleTouchStart = (e) => {
    const touchPos = e.target.getStage().getPointerPosition();
    handleMouseDown({ ...e, target: { getStage: () => ({ getPointerPosition: () => touchPos }) } });
  };

  const handleTouchMove = (e) => {
    const touchPos = e.target.getStage().getPointerPosition();
    handleMouseMove({ ...e, target: { getStage: () => ({ getPointerPosition: () => touchPos }) } });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  useEffect(() => {
    // Add event listeners for scroll, mouse down, mouse move, mouse up, touch start, touch move, and touch end
    window.addEventListener("wheel", handleScroll);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener("wheel", handleScroll);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    // ... (Previous code)
  );
};

export default Whiteboard;
