// import { NextResponse } from "next/server";
// import { createUser, updateUser } from "@/lib/users";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { id, email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     if (id) {
//       // Update existing user
//       const updated = await updateUser(id, email, password);
//       if (!updated) {
//         return NextResponse.json(
//           { error: "User not found or nothing to update" },
//           { status: 404 }
//         );
//       }
//       return NextResponse.json({ message: "User updated" }, { status: 200 });
//     } else {
//       // Create new user
//       const user = await createUser(email, password);
//       if (!user) {
//         return NextResponse.json(
//           { error: "Failed to create user" },
//           { status: 500 }
//         );
//       }
//       return NextResponse.json(
//         { message: "User created", user },
//         { status: 201 }
//       );
//     }
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || "Database error" },
//       { status: 500 }
//     );
//   }
// }

// // export async function PUT(request: Request) {
// //   try {
// //     const body = await request.json();
// //     const { id, email, password } = body;

// //     if (!id) {
// //       return NextResponse.json(
// //         { error: "User ID is required" },
// //         { status: 400 }
// //       );
// //     }

// //     const fields: string[] = [];
// //     const values: any[] = [];

// //     if (email) {
// //       fields.push("email = ?");
// //       values.push(email);
// //     }

// //     if (password) {
// //       fields.push("password = ?");
// //       values.push(password);
// //     }

// //     if (fields.length === 0) {
// //       return NextResponse.json(
// //         { error: "No fields to update" },
// //         { status: 400 }
// //       );
// //     }

// //     values.push(id);

// //     const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
// //     const [result] = (await db.query(sql, values)) as [ResultSetHeader, any];

// //     return NextResponse.json({
// //       message: "User updated",
// //       affectedRows: result.affectedRows,
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     return NextResponse.json({ error: "Database error" }, { status: 500 });
// //   }
// // }






