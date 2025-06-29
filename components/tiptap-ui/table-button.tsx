"use client"

import * as React from "react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export function TableButton() {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run()
  }

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run()
  }

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  const toggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run()
  }

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run()
  }

  const toggleHeaderCell = () => {
    editor.chain().focus().toggleHeaderCell().run()
  }

  const mergeCells = () => {
    editor.chain().focus().mergeCells().run()
  }

  const splitCell = () => {
    editor.chain().focus().splitCell().run()
  }

  const canInsertTable = editor.can().insertTable()
  const canAddColumnBefore = editor.can().addColumnBefore()
  const canAddColumnAfter = editor.can().addColumnAfter()
  const canDeleteColumn = editor.can().deleteColumn()
  const canAddRowBefore = editor.can().addRowBefore()
  const canAddRowAfter = editor.can().addRowAfter()
  const canDeleteRow = editor.can().deleteRow()
  const canDeleteTable = editor.can().deleteTable()
  const canToggleHeaderColumn = editor.can().toggleHeaderColumn()
  const canToggleHeaderRow = editor.can().toggleHeaderRow()
  const canToggleHeaderCell = editor.can().toggleHeaderCell()
  const canMergeCells = editor.can().mergeCells()
  const canSplitCell = editor.can().splitCell()

  if (!editor.isActive("table")) {
    return (
      <Button
        onClick={insertTable}
        disabled={!canInsertTable}
        data-active={editor.isActive("table")}
        title="Insert table"
      >
        <TableIcon className="tiptap-button-icon" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-active={editor.isActive("table")}
          title="Table options"
        >
          <TableIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={addColumnBefore} disabled={!canAddColumnBefore}>
          Add column before
        </DropdownMenuItem>
        <DropdownMenuItem onClick={addColumnAfter} disabled={!canAddColumnAfter}>
          Add column after
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteColumn} disabled={!canDeleteColumn}>
          Delete column
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={addRowBefore} disabled={!canAddRowBefore}>
          Add row before
        </DropdownMenuItem>
        <DropdownMenuItem onClick={addRowAfter} disabled={!canAddRowAfter}>
          Add row after
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteRow} disabled={!canDeleteRow}>
          Delete row
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleHeaderColumn} disabled={!canToggleHeaderColumn}>
          Toggle header column
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleHeaderRow} disabled={!canToggleHeaderRow}>
          Toggle header row
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleHeaderCell} disabled={!canToggleHeaderCell}>
          Toggle header cell
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={mergeCells} disabled={!canMergeCells}>
          Merge cells
        </DropdownMenuItem>
        <DropdownMenuItem onClick={splitCell} disabled={!canSplitCell}>
          Split cell
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={deleteTable} disabled={!canDeleteTable}>
          Delete table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 