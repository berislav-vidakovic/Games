FROM alpine:3.20

WORKDIR /frontend

# Copy already-built files
COPY panel/dist panel/
COPY sudoku/dist sudoku/
COPY connect4/dist connect4/

# Container does NOTHING
CMD ["sleep", "infinity"]
